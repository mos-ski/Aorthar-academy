import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-4 max-w-md">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
        <h1 className="text-3xl font-bold">Account Suspended</h1>
        <p className="text-muted-foreground">
          Your account has been temporarily suspended. Please contact Aorthar support or an administrator
          for help restoring access.
        </p>
        <Button asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
