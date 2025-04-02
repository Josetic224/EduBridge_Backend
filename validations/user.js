const z = require("zod");

// Define the list of specialties
const specialties = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Literature",
  "History",
  "Art",
  "Music",
];

const UserSchema = z
  .object({
    userName: z.string({
      invalid_type_error: "Name must be a string",
      required_error: "Name is required",
    }),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid Email"),
    password: z.string().min(6),
    role: z.enum(["STUDENT", "LECTURER"]),
    university: z.string(),
    country: z.string(),
    passcode: z.string().min(4, "Passcode is too Short").optional(),
    specialty: z.string().optional(),
    department: z.string().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.role === "LECTURER" && !data.specialty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Specialty is required for lecturers",
        path: ["specialty"],
      });
    }
    
    if (data.role === "LECTURER" && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for lecturers",
        path: ["department"],
      });
    }
  });

const VerifyUserSchema = z
  .object({
    email: z
      .string({
        required_error: "email address is required",
      })
      .email("invalid email address"),
    otp: z
      .string()
      .min(4, "otp must be 4 characters long")
      .max(4, "otp can only be 4 characters long")
      .optional(),
    requestResend: z.boolean().optional(),
  })
  .strict();
const LoginUserSchema = z
  .object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email"),
    password: z.string({
      required_error: "Password is required",
    }),
  })
  .strict();

const editUserNameSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(20, "Username cannot exceed 20 characters."),
});

const editEmailOtp = z.object({
  otp: z
    .string()
    .min(4, "otp must be 4 characters long")
    .max(4, "otp can only be 4 characters long")
    .optional(),
});

const editEmailSchema = z.object({
  email: z.string().email("Invalid email format."),
});

exports.deleteStudent = async (req, res) => {
  try {
    // Extract token from headers
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    // Decode and validate token
    let decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Delete the student
    await Student.findByIdAndDelete(studentId);

    return res.status(200).json({ message: "Student successfully deleted." });
  } catch (error) {
    console.error("DELETE STUDENT ERROR =>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.editUserName = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    let decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    const body = editUserNameSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }

    const { userName } = body.data;
    const checkUserName = await User.findOne({ userName });
    if (checkUserName && checkUserName._id.toString() !== userId) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Username updated successfully", user: updatedUser });
  } catch (error) {
    console.error("EDIT USERNAME ERROR =>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.editEmail = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token is missing." });
    }

    let decoded = decodeToken(token, process.env.JWT_SECRET);
    const userId = decoded?.user?.userId;
    if (!userId) {
      return res.status(400).json({ error: "Invalid token: user ID missing." });
    }

    const body = editEmailSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.issues });
    }

    const { email } = body.data;
    const checkEmail = await User.findOne({ email });
    if (checkEmail && checkEmail._id.toString() !== userId) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Email updated successfully", user: updatedUser });
  } catch (error) {
    console.error("EDIT EMAIL ERROR =>", error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  }
};

exports.editUserNameSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(20, "Username cannot exceed 20 characters."),
});

exports.editEmailSchema = z.object({
  email: z.string().email("Invalid email format."),
});

const VerifyPasswordOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).optional(), // Make OTP optional for resending
  requestResend: z.boolean().optional(), // Allow requestResend key
});

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

const setPasscodeSchema = z
  .object({
    passcode: z.string().min(4).max(4),
    confirmPasscode: z.string().min(4).max(4),
  })
  .strict();

const VerifyPasscodeOtpSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(4).optional(), // Make OTP optional for resending
    requestResend: z.boolean().optional(), // Allow requestResend key
  })
  .strict();

const twoFA_Schema = z.object({
  totp: z.string().min().max(6),
});

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
  twoFA_Schema,
  editEmailOtp,
};
