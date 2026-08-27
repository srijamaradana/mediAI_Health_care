import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["patient", "doctor"]),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
  })
  .refine((data) => data.role !== "doctor" || !!data.specialization, {
    message: "Specialization is required for doctors",
    path: ["specialization"],
  })
  .refine((data) => data.role !== "doctor" || !!data.licenseNumber, {
    message: "License number is required for doctors",
    path: ["licenseNumber"],
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: "patient" } });

  const role = watch("role");

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await registerUser(values);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-teal-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Activity className="h-10 w-10 text-primary-600" />
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500">Join MediAI in seconds</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {["patient", "doctor"].map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm capitalize ${
                    role === r ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-300 text-gray-600"
                  }`}
                >
                  <input type="radio" value={r} {...register("role")} className="hidden" />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input {...register("name")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Jane Doe" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" {...register("email")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input type="password" {...register("password")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="At least 8 characters" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {role === "doctor" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Specialization</label>
                <input {...register("specialization")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Cardiology" />
                {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">License Number</label>
                <input {...register("licenseNumber")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="LIC-12345" />
                {errors.licenseNumber && <p className="mt-1 text-xs text-red-500">{errors.licenseNumber.message}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
