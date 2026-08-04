export const password_reg_exp = /[^A-Za-z0-9!@#$%^&*?(){}[\].,:;"'-=+_\\/|<>]/g; // 正则逆向判断，保持老版本一致，否则容易给老用户带来问题

export const email_reg_exp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
