import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const IS_AUTHORIZED_BY_API_KEY = "isAuthorizedByApiKey";
export const IS_ADMIN = "isAdmin";

export const Admin = () => SetMetadata(IS_ADMIN, true);
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Authorized = () => SetMetadata(IS_PUBLIC_KEY, false);
export const AuthorizedByApiKey = () =>
  SetMetadata(IS_AUTHORIZED_BY_API_KEY, true);
