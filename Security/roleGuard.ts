export const roleGuard = (role: string) => {
    return (req: any, res: any, next: any) => {
        next();
    };
};