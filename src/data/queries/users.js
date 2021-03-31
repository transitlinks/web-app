import { getLog, graphLog } from '../../core/log';
const log = getLog('data/queries/users');

import bcrypt from 'bcrypt-nodejs';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLList, GraphQLString } from 'graphql';
import { UserType, UserInputType } from '../types/UserType';
import { userRepository } from '../source';


import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from '../../config';

export const UserQueryFields = {

  user: {

    type: new GraphQLList(UserType),
    description: 'Transitlinks user',
    args: {
      uuid: { type: GraphQLString }
    },
    resolve: async ({ request }, { uuid }) => {
      const user = await userRepository.getByUuid(uuid);
      return { uuid: user.uuid, email: user.email };
    }

  },

  resetPassword: {

    type: GraphQLString,
    description: 'Check reset password code',
    args: {
      code: { type: GraphQLString }
    },
    resolve: async ({ request }, { code }) => {

      log.info(`graphql-request=reset-password code=${code}`);

      const user = await userRepository.getUser({ resetPasswordCode: code });
      if (user) {
        return user.email;
      }

      return null;

    }

  },

};

export const UserMutationFields = {

  user: {

    type: UserType,
    description: 'Update a user',
    args: {
      uuid: { type: GraphQLString },
      values: { type: UserInputType }
    },
    resolve: async ({ request }, { uuid, values }) => {
      const { password } = values;
      if (password && password.length > 0) {
        values.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
      }

      let user = await userRepository.update(uuid, values);
      if (user.logins === 1) user = await userRepository.update(uuid, { logins: 2 });
      console.log(user);
      return user.toJSON();
    }

  },

  requestResetPassword: {

    type: GraphQLString,
    description: 'Get reset password code',
    args: {
      email: { type: GraphQLString }
    },
    resolve: async ({ request }, { email }) => {

      log.info(`graphql-request=request-reset-password email=${email}`);

      if (email) {

        let user = await userRepository.getUser({ email });
        if (user) {

          user = await userRepository.update(user.uuid, { resetPasswordCode: uuidv4() });

          const testAccount = await nodemailer.createTestAccount();

          const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
              user: SMTP_USER || testAccount.user, // generated ethereal user
              pass: SMTP_PASSWORD || testAccount.pass, // generated ethereal password
            },
          });

          const resetUrl = `https://transitlinks.net/reset-password/${user.resetPasswordCode}`;
          let result = await transporter.sendMail({
            from: '"Transitlinks Support" <no-reply@transitlinks.net>',
            to: email,
            subject: 'Transitlinks - Reset password',
            text: `You can now follow this link to reset your password: ${resetUrl}`,
            html: `<span>You can now follow this link to reset your password:</span>&nbsp;<a href="${resetUrl}">${resetUrl}</a>"`,
          });

          log.info(`graphql-request=request-reset-password messageId=${result ? result.messageId : null}`);

          if (result.messageId) return email;

          return 'ERROR';

        }

      }

      return 'ERROR';

    }

  },

  codeResetPassword: {

    type: GraphQLString,
    description: 'Reset a password',
    args: {
      code: { type: GraphQLString },
      password: { type: GraphQLString }
    },
    resolve: async ({ request }, { code, password }) => {

      log.info(`graphql-request=code-reset-password code=${code}`);

      if (code && password && password.length > 0) {
        let user = await userRepository.getUser({ resetPasswordCode: code });
        if (user) {
          const encryptedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
          user = await userRepository.update(user.uuid, { password: encryptedPassword, resetPasswordCode: null });
          return user.email;
        }
      }

      return 'ERROR';

    }

  }

};
