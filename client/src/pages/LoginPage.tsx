import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type Form = z.infer<typeof Schema>;

export function LoginPage() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<Form>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: Form) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch {
      toast({ title: 'Sign-in failed', description: 'Check your email and password.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-surface px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-card-1 p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
          <span className="font-bold text-xl text-on-surface">VolunteerHub</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-surface">Sign in</h1>
        <p className="text-sm text-on-surface-variant mt-1">Welcome back. Please enter your details.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-sm text-on-surface-variant text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Register as volunteer</Link>
        </p>
      </div>
    </div>
  );
}
