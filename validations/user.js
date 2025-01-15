const z = require('zod');

const UserSchema = z
.object({
    userName: z.string({
        invalid_type_error: 'Name must be a string',
        required_error: 'Name is required'
    }),
    email: z.string({
        required_error: 'Email is required',
    }).email("Invalid Email"),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "LECTURER"]),
    university:z.string(),
    country:z.string(),
    passcode:z.string().min(4, "Passcode is too Short").optional()
})
.strict();

const VerifyUserSchema = z
  .object({
    email: z
      .string({
        required_error: "email address is required",
      })
      .email("invalid email address"),
    otp: z
      .string({
        required_error: "otp is required",
      })
      .min(4, "otp must be 4 characters long")
      .max(4, "otp can only be 4 characters long"),
  })
  .strict();


  const LoginUserSchema = z.object({
    email: z.string({
      required_error: "Email is required",
    }).email("Invalid email"),
    password: z.string({
      required_error: "Password is required",
    }),
})
.strict();



const VerifyPasswordOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(4).max(5),
  })
  .strict();





const ResetPasswordSchema = z
.object({
  repeatPassword: z.string().min(4, "Password is too short"),
  newPassword: z.string().min(4, "Password is too short"),
  email: z.string().email(),
})
.strict();


const UpdatePasswordSchema = z
  .object({
    oldPassword: z.string().min(4, "Password is too short"),
    newPassword: z.string().min(4, "Password is too short"),
    email: z.string().email(),
  })
  .strict()
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password can not be the same as old password",
    path: ["newPassword"],
  });


  const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, "Password is too short"),
    newPassword: z.string().min(4, "Password is too short"),
    repeatNewPassword: z.string().min(4, "Password is too short"),
  })
  .strict();

  const setPasscodeSchema = z.object({
    passcode: z.string().min(4).max(4),
    confirmPasscode: z.string().min(4).max(4)
  })
  .strict();

  const VerifyPasscodeOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(4).max(5),
  })
  .strict();

  
  const twoFA_Schema = z
  .object({
    totp:z.string().min().max(6)
  })

  module.exports = {
    UserSchema,
    VerifyUserSchema,
    LoginUserSchema,
    VerifyPasswordOtpSchema,
    ResetPasswordSchema,
    UpdatePasswordSchema,
    ChangePasswordSchema,
    setPasscodeSchema,
    VerifyPasscodeOtpSchema,
    twoFA_Schema
  };