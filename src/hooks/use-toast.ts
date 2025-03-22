
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import { useToast as useToastShadcn } from "@/components/ui/use-toast"

type ToastOptions = Omit<ToastProps, "id"> & {
  action?: ToastActionElement
}

export function useToast() {
  return useToastShadcn()
}

export function toast(props: ToastOptions) {
  const { toast } = useToastShadcn()
  return toast(props)
}
