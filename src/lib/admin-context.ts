export type AdminContext = {
  admin: {
    id: string
  }
}

export function asAdminContext(context: unknown) {
  return context as AdminContext
}

export function getAdminId(context: AdminContext) {
  return context.admin.id
}
