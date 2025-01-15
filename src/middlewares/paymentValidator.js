const { z } = require("zod");

const paymentValidationSchema = z.object({
  amount: z.number().min(1, { message: "Amount must be greater than 0" }),
  currency: z.string().default("INR"),
  customer_name: z
    .string()
    .min(2)
    .max(100, { message: "Name must be between 2 and 100 characters" }),
  customer_email: z.string().email({ message: "Invalid email address" }),
  customer_phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits" }),
});

const validatePaymentRequest = async (req, res, next) => {
  try {
    paymentValidationSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

module.exports = { validatePaymentRequest };
