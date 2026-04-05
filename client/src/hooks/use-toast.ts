// Stub re-export — use sonner's toast directly instead
export { toast } from "sonner";
export const useToast = () => ({ toast: (msg: string) => console.log(msg) });
