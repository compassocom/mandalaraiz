import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = await bcrypt.hash(password, 12);
console.log('Password:', password);
console.log('Hash:', hash);

const password2 = 'moderator123';
const hash2 = await bcrypt.hash(password2, 12);
console.log('Password:', password2);
console.log('Hash:', hash2);
