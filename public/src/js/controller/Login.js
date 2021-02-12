define(['authController', 'uuid', 'swal', 'css!css/login-register'], (AuthController, uuid, swal) => {
    let _router;

    return class Login {
        constructor(router) {
            _router = router;

            const path = sessionStorage.getItem('path');
            const segment = path.split('/');

            if (segment.length == 2) {
                (async () => {
                    try {
                        let status;
                        const method = segment.pop();

                        if (method == 'google') {
                            status = await Login.loginWithGoogle();
                        } else if (method == 'facebook') {
                            status = await Login.loginWithFacebook();
                        }

                        const result = await Promise.resolve(status);

                        if (result.additionalUserInfo.isNewUser &&
                            ((result.additionalUserInfo.providerId == GOOGLE_PROVIDER &&
                                    result.additionalUserInfo.profile.verified_email) ||
                                (result.additionalUserInfo.providerId == FACEBOOK_PROVIDER))) {

                            const data = result.user.providerData[0];
                            const userData = userModel.createUser(data.displayName, data.email);

                            userData.uid = result.user.uid;
                            userData.timestamp = result.user.metadata.creationTime;

                            const isUserAdded = await userModel.addUser(userData.uid, userData);
                            if (isUserAdded) {
                                const imageId = uuid();
                                const status = await userModel.setProfileImage(userData.uid, {
                                    url: data.photoURL,
                                    name: imageId
                                });
                            }
                        }

                    } catch (e) {
                        swal("Unable to login", e.message,
                            "error");
                    }

                })();
            } else {
                Login.initLoginForm();
            }
        }

        static initLoginForm() {
            const loginForm = document.querySelector('#login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = loginForm['email'].value.trim();
                    const password = loginForm['password'].value.trim();

                    if (email.length > 0 && password.length > 0) {

                        try {
                            const auth = await AuthController.signIn(email.trim(), password.trim());
                            if (auth) {
                                swal("Login successful", "",
                                    "success");
                            } 
                        } catch (e) {
                            switch (e.code) {
                                case 'auth/user-not-found':
                                    swal("Unable to login", 'A user with this email address doesn\'t exist',
                                        "error");
                                    break;
                                default:
                                    swal("Unable to login", e.message,
                                        "error");
                                    break;
                            }

                        }

                    } else {
                        swal("Unable to login", "Please fill out the email and password.",
                            "error");
                    }
                });
            }
        }

        static loginWithGoogle() {
            const googleProvider = new firebase.auth.GoogleAuthProvider();
            return firebase.auth().signInWithPopup(googleProvider);

        }

        static loginWithFacebook() {
            const facebookProvider = new firebase.auth.FacebookAuthProvider();
            return firebase.auth().signInWithPopup(facebookProvider);
        }
    }
});