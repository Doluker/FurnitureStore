import { ref, set} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { db, auth } from './firebase.js';
const registrationForm = document.getElementById('registrationForm');

async function saveClient(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    if (!email || !password || !confirmPassword) {
        Swal.fire({ icon: "error", title: "Ошибка", text: "Введите все поля!", });
        return;
    } else if (password.length < 6) {
         Swal.fire({ icon: "error", title: "Ошибка", text: "Пароль должен быть не менее 6 символов.", });
         return;
    } else if (password !== confirmPassword) {
        Swal.fire({ icon: "error", title: "Ошибка", text: "Пароли не совпадают!", });
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        await set(ref(db, `Authorization/${uid}`), {
             ID_Authorization: uid, 
             Registration_Email: email, 
             ID_Post: 2,
        });

        Swal.fire({
            icon: "success",
            title: "Успех",
            text: "Новый клиент зарегистрирован и добавлен в базу!",
        }).then(() => {
            window.location.href = "catalog.html";
        });

    } catch (error) {
        let errorText = "Произошла неизвестная ошибка.";
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorText = "Этот email уже зарегистрирован.";
                break;
            case 'auth/invalid-email':
                errorText = "Некорректный формат email.";
                break;
            case 'auth/weak-password':
                errorText = "Пароль слишком слабый (минимум 6 символов).";
                break;
            default:
                console.error("Firebase Auth Error:", error.message);
                break;
        }

        Swal.fire({
            icon: "error",
            title: "Ошибка регистрации",
            text: errorText,
        });
    }
}

registrationForm.addEventListener('submit', saveClient);