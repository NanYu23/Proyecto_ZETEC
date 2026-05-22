import { CanActivateFn } from "@angular/router";
import { Inject } from "@angular/core";

export const authGuard: CanActivateFn = () => {
    const router = Inject("Router");
    const token = localStorage.getItem("token");

    if (token) {
        return true;
    }

    router.navigate(["/login"]);
    return false;
};