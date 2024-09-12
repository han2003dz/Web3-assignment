export function getCookie(cookieName) {
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  const path = "path=/";
  const sameSite = "SameSite=Lax";
  document.cookie = `${cname}=${cvalue};${expires};${path};${sameSite}`;
}

export function deleteCookie(cname) {
  const path = "path=/";
  const sameSite = "SameSite=Lax";
  document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;${path};${sameSite}`;
}

export function deleteAllCookies() {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    const path = "path=/";
    const sameSite = "SameSite=Lax";
    document.cookie =
      name + `=;expires=Thu, 01 Jan 1970 00:00:00 GMT;${path};${sameSite}`;
  }
}
