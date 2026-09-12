import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "../components/commen/Input";
import Button from "../components/commen/Button";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const cardVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Login() {
    const [enrollment, setEnrollment] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!enrollment.trim() || !password.trim()) {
            toast.error("Enrollment number ane password banne bharo.");
            return;
        }

        setLoading(true);
        try {
            await login(enrollment, password);
            const from =
                (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed, ferithi try karo.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#e0e5ec] p-5">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="w-full max-w-95 rounded-3xl bg-[#e0e5ec] p-10 shadow-[9px_9px_18px_#a3b1c6,-9px_-9px_18px_#ffffff]"
            >
                <motion.div
                    variants={itemVariants}
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e0e5ec] text-[#5b6eae] shadow-[6px_6px_12px_#a3b1c6,-6px_-6px_12px_#ffffff]"
                >
                    <FaLock size={20} />
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="mb-1.5 text-center text-[22px] font-semibold text-slate-700"
                >
                    Welcome back
                </motion.h1>
                <motion.p
                    variants={itemVariants}
                    className="mb-7 text-center text-[13.5px] leading-relaxed text-slate-500"
                >
                    Continue to your account using your enrollment number
                </motion.p>

                <motion.form variants={itemVariants} onSubmit={handleSubmit}>
                    <Input
                        label="Enrollment Number"
                        name="enrollment"
                        type="text"
                        placeholder="e.g. 21CE045"
                        value={enrollment}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setEnrollment(e.target.value)}
                        icon={<FaUser size={16} />}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        icon={<FaLock size={16} />}
                        rightAction={
                            <span onClick={() => setShowPassword((s) => !s)}>
                                <AnimatePresence mode="wait" initial={false}>
                                    {showPassword ? (
                                        <motion.span
                                            key="eye-open"
                                            initial={{ opacity: 0, rotate: -20 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 20 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex"
                                        >
                                            <FaEye size={16} />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="eye-closed"
                                            initial={{ opacity: 0, rotate: 20 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: -20 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex"
                                        >
                                            <FaEyeSlash size={16} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </span>
                        }
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Log In"}
                    </Button>
                </motion.form>

                <motion.div variants={itemVariants} className="mt-5 text-center text-[13px] text-slate-500">
                    Forgot password?{" "}
                    <button
                        type="button"
                        className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[#5b6eae]"
                    >
                        Reset here
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}