import { redirect } from 'next/navigation';
import { checkUserSubscription } from '@/app/actions';
import { createClient } from '../../supabase/server';
import { AUTH_DISABLED } from '@/lib/auth-config';

interface SubscriptionCheckProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export async function SubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: SubscriptionCheckProps) {
    if (AUTH_DISABLED) {
        return <>{children}</>;
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/sign-in');
    }

    const isSubscribed = await checkUserSubscription(user?.id!);

    if (!isSubscribed) {
        redirect(redirectTo);
    }

    return <>{children}</>;
}
