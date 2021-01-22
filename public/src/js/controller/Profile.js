define([
    'view',
    'overviewComponent',
    'profileComponent',
    'suggestionsComponent',
    'p_connectionsComponent',
    'userModel',
    'chatModel',
    'util',
    'validator',
    'dateComponent',
    'authController',
    'css!css/profile',
    'css!css/modal'
], (View,
    OverviewComponent,
    ProfileComponent,
    SuggestionsComponent,
    ConnectionComponent,
    UserModel,
    ChatModel,
    routes,
    Util,
    Validator,
    DateComponent,
    Auth) => {

    const _userModel = new UserModel(firebase.firestore(), firebase.auth());
    const _chatModel = new ChatModel(firebase.firestore());

    let _profileView;

    const HOME_TAB = 'tab-1';
    let _contentId;
    let _selected;

    let _router;
    let _state

    ////////////////////// edit events
    const _initBioModalEvents = () => {
        const text = document.querySelector("#form-bio textarea");
        let oldText = _state.bio;
        if (_state.bio) {
            text.value = _state.bio;
        }

        const wordCount = document.querySelector("#count #current");
        wordCount.innerText = text.value.length;
        const limit = 600;

        text.addEventListener("keyup", function() {
            const characters = text.value.split('');
            wordCount.innerText = characters.length;

            if (characters.length > limit) {
                text.value = text.value.substring(0, limit);
                wordCount.innerText = limit;
            }
        });

        _initModalEvents('#modal-bio', '#edit-bio', '#form-bio', function() {
            return (async () => {
                if (text.value.length == 0) {
                    console.log('Empty field');
                    return false;
                } else if (oldText == text.value) {
                    console.log('No changes');
                    return false;
                } else {
                    try {
                        const status = await _userModel
                            .mergeUpdateUser(firebase.auth().currentUser.uid, { bio: text.value });

                        if (status) {
                            console.log('Update successful');
                            _profileView.updateBio(text.value);
                            oldText = text.value;
                            return true;
                        }

                        return false;
                    } catch (e) {
                        console.log(e);
                        return false;
                    }
                }
            })();

        }, function() {
            if (text.value.length == 0 && oldText.length) {
                text.value = oldText;
            }
            return false;
        });
    }

    const _initEducationModalEvents = () => {
        const name = document.querySelector('#school-name');
        const acad = document.querySelector('#acad');
        const degree = document.querySelector('#degree');
        const course = document.querySelector('#course');
        const since = document.querySelector('#since');
        const college = since.querySelector('#college');
        const highschool = since.querySelector('#highschool');
        const selectHighschool = document.querySelector('#add-highschool');
        const selectCollege = document.querySelector('#add-college');

        selectCollege.addEventListener('click', () => {
            if (name.classList.contains('remove')) {
                name.classList.remove('remove');
            }

            if (since.classList.contains('remove')) {
                since.classList.remove('remove');
            }

            acad.style.display = 'flex';
            college.style.display = 'block';
            highschool.style.display = 'none';

            name.setAttribute('placeholder', 'College name');
            _selected = 'college';
        });

        let selectStartYear = document.querySelector('#college .start .year');
        let selectStartMonth = document.querySelector('#college .start .month');
        let selectStartDay = document.querySelector('#college .start .day');

        let startDate = new DateComponent(selectStartYear, selectStartMonth, selectStartDay);

        let selectEndYear = document.querySelector('#college .end .year');
        let selectEndtMonth = document.querySelector('#college .end .month');
        let selectEndDay = document.querySelector('#college .end .day');

        let endDate = new DateComponent(selectEndYear, selectEndtMonth, selectEndDay);


        selectHighschool.addEventListener('click', () => {
            if (name.classList.contains('remove')) {
                name.classList.remove('remove');
            }

            if (since.classList.contains('remove')) {
                since.classList.remove('remove');
            }

            acad.style.display = 'none';

            college.style.display = 'none';
            highschool.style.display = 'flex';

            name.setAttribute('placeholder', 'HighSchool name');
            _selected = 'highschool';
        });

        let selectEndYearHighschool = document.querySelector('#highschool .year');
        let endDateHighSchool = new DateComponent(selectEndYearHighschool);

        _initModalEvents('#modal-education', '#edit-education', '#form-education', function() {

            let data = {
                education: {
                    college: {}
                }
            };

            if (_selected == undefined) {
                console.log('Please select an education level');
                return false;
            } else if (_selected == 'college') {
                if (name.value.length == 0) {
                    console.log('Empty school name');
                    return false;
                } else if (degree.value == 'empty') {
                    console.log('Select a degree');
                    return false;
                } else if (course.value.length == 0) {
                    console.log('Empty course');
                    return false;
                }

                if (!((selectStartYear.value == 'empty' &&
                            selectStartMonth.value == 'empty' &&
                            selectStartDay.value == 'empty') ||
                        (selectStartYear.value != 'empty' &&
                            selectStartMonth.value != 'empty' &&
                            selectStartDay.value != 'empty'))) {

                    console.log('Incomplete fields');
                    return false;

                } else {
                    if (selectStartYear.value != 'empty' &&
                        selectStartMonth.value != 'empty' &&
                        selectStartDay.value != 'empty') {

                        data.education.college.start = {
                            year: selectStartYear.value,
                            month: selectStartMonth.value,
                            day: selectStartDay.value
                        }

                    }
                }

                if (!((selectEndYear.value == 'empty' &&
                            selectEndtMonth.value == 'empty' &&
                            selectEndDay.value == 'empty') ||
                        (selectEndYear.value != 'empty' &&
                            selectEndtMonth.value != 'empty' &&
                            selectEndDay.value != 'empty'))) {

                    console.log('Incomplete fields');
                    return false;

                } else {
                    if (selectEndYear.value != 'empty' &&
                        selectEndtMonth.value != 'empty' &&
                        selectEndDay.value != 'empty') {

                        data.education.college.end = {
                            year: selectEndYear.value,
                            month: selectEndtMonth.value,
                            day: selectEndDay.value
                        }
                    }

                }

                data.education.college.name = name.value;
                data.education.college.course = course.value;

                return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data)
                    .then(() => {
                        console.log('Update successful');
                        _profileView.updateCollege(data);
                        return true;
                    }).catch(err => {
                        console.log(err.message);
                        return false;
                    });

            } else if (_selected == 'highschool') {
                let data = {
                    education: {
                        highschool: {}
                    }
                };

                if (name.value.length == 0) {
                    console.log('Empty school name');
                    return false;
                }


                if (selectEndYearHighschool.value != 'empty') {
                    data.education.highschool.end = {
                        year: selectEndYearHighschool.value
                    }
                }

                data.education.highschool.name = name.value;

                return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data).then(() => {
                    console.log('Update successful');
                    _profileView.updateHighSchool(data);
                    return true;
                }).catch(err => {
                    console.log(err.message);
                    return false;
                });
            }
            return false;
        });
    }

    const _initWorkplaceModalEvents = () => {
        const name = document.querySelector('#workplace-name');
        const position = document.querySelector('#workplace-position');
        const description = document.querySelector('#workplace-description');

        let selectStartYear = document.querySelector('#workplace-since .start .year');
        let selectStartMonth = document.querySelector('#workplace-since .start .month');
        let selectStartDay = document.querySelector('#workplace-since .start .day');
        let startDate = new DateComponent(selectStartYear, selectStartMonth, selectStartDay);

        let selectEndYear = document.querySelector('#workplace-since .end .year');
        let selectEndtMonth = document.querySelector('#workplace-since .end .month');
        let selectEndDay = document.querySelector('#workplace-since .end .day');
        let endDate = new DateComponent(selectEndYear, selectEndtMonth, selectEndDay);

        _initModalEvents('#modal-workplace', '#edit-workplace', '#form-workplace', function() {
            let data = {
                workplace: {

                }
            };

            if (name.value.length == 0) {
                console.log('Empty workplace name');
                return false;
            }

            data.workplace.name = name.value;

            if (position.value) {
                data.workplace.position = position.value;
            }

            if (description.value) {
                data.workplace.description = description.value;
            }

            if (!((selectStartYear.value == 'empty' &&
                        selectStartMonth.value == 'empty' &&
                        selectStartDay.value == 'empty') ||
                    (selectStartYear.value != 'empty' &&
                        selectStartMonth.value != 'empty' &&
                        selectStartDay.value != 'empty'))) {
                console.log('Incomplete fields');
                return false;
            } else {
                if (selectStartYear.value != 'empty' &&
                    selectStartMonth.value != 'empty' &&
                    selectStartDay.value != 'empty') {
                    data.workplace.start = {
                        year: selectStartYear.value,
                        month: selectStartMonth.value,
                        day: selectStartDay.value
                    }
                }
            }


            if (!((selectEndYear.value == 'empty' &&
                        selectEndtMonth.value == 'empty' &&
                        selectEndDay.value == 'empty') ||
                    (selectEndYear.value != 'empty' &&
                        selectEndtMonth.value != 'empty' &&
                        selectEndDay.value != 'empty'))) {

                console.log('Incomplete fields');
                return false;

            } else {
                if (selectEndYear.value != 'empty' &&
                    selectEndtMonth.value != 'empty' &&
                    selectEndDay.value != 'empty') {

                    data.workplace.end = {
                        year: selectEndYear.value,
                        month: selectEndtMonth.value,
                        day: selectEndDay.value
                    }

                }
            }

            return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data)
                .then(() => {
                    console.log('Update successful');
                    _profileView.updateWorkplace(data);
                    return true;
                }).catch(err => {
                    console.log(err.message);
                    return false;
                });
        });
    }

    const _initAddressModalEvents = () => {
        const name = document.querySelector('#address-name');
        _initModalEvents('#modal-address', '#edit-address', '#form-address', function() {
            let data = {};
            if (name.value.length == 0) {
                console.log('Empty address name');
                return false;
            }

            return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, { address: name.value })
                .then(() => {
                    console.log('Update successful');
                    _profileView.updateAddress(name.value);
                    return true;
                }).catch(err => {
                    console.log(err.message);
                    return false;
                });
        });
    }

    const _initContactModalEvents = () => {
        const emailPrimary = document.querySelector('#email-primary');
        const emailSecondary = document.querySelector('#email-secondary');
        const mobilePrimary = document.querySelector('#mobile-primary');
        const mobileSecondary = document.querySelector('#mobile-secondary');

        let isPrimaryEmailReadOnly = true;
        let emailUpdateCount = _state.emailUpdateCount;

        const provider = firebase.auth().currentUser.providerData[0].providerId;

        if (firebase.auth().currentUser.email) {
            emailPrimary.value = firebase.auth().currentUser.email;
        }

        if (_state.email[1]) {
            emailSecondary.value = _state.email[1];
        }

        if (_state.mobile && _state.mobile[0]) {
            mobilePrimary.value = _state.mobile[0];
        }

        if (_state.mobile && _state.mobile[1]) {
            mobileSecondary.value = _state.mobile[1];
        }

        let oldEmailPrimary = emailPrimary.value;
        let oldEmailSecondary = emailSecondary.value;
        let oldMobilePrimary = mobilePrimary.value;
        let oldMobileSecondary = mobileSecondary.value;

        if (provider != EMAIL_PASSWORD_SIGN_IN_METHOD) {
            emailPrimary.readOnly = true;
        } else {
            isPrimaryEmailReadOnly = false;
        }

        _initModalEvents('#modal-contact', '#edit-contact', '#form-contact', function() {
            let data = {};
            data.email = ['', ''];
            data.mobile = ['', ''];

            /*if((isPrimaryEmailReadOnly && 
            	!emailSecondary.value.length &&
            	!mobilePrimary.value.length && 
            	!mobileSecondary.value.length) ||
            	(!isPrimaryEmailReadOnly && 
            	!emailPrimary.value.length &&
            	!emailSecondary.value.length && 
            	!mobilePrimary.value.length &&
            	!mobileSecondary.value.length)

            	){
				
            	console.log('No contact info to update');
            	return false;
            	
            }else{*/
            if (emailPrimary.value.length && !Validator.isEmailValid(emailPrimary.value)) {
                console.log('Invalid email address');
                return false;
            } else {
                data.email[0] = emailPrimary.value;
            }

            if (emailSecondary.value.length && !Validator.isEmailValid(emailSecondary.value)) {
                console.log('Invalid email address');
                return false;
            } else {
                data.email[1] = emailSecondary.value;
            }

            if (mobilePrimary.value.length) {
                data.mobile[0] = mobilePrimary.value;
            }

            if (mobileSecondary.value.length) {
                data.mobile[1] = mobileSecondary.value;
            }

            if (oldEmailPrimary == emailPrimary.value &&
                oldEmailSecondary == emailSecondary.value &&
                oldMobilePrimary == mobilePrimary.value &&
                oldMobileSecondary == mobileSecondary.value
            ) {
                console.log('No fucking changes!!');
                return false;
            }

            if (emailPrimary.value.length && emailSecondary.value.length &&
                emailPrimary.value == emailSecondary.value) {
                console.log('Primary email and secondary email must not be the same')
                return false;
            }

            if (!data.email.length && !data.mobile.length) {
                console.log('no valid data')
                return false;
            } else {
                (async () => {
                    try {
                        if (!isPrimaryEmailReadOnly && emailPrimary.value.length &&
                            emailPrimary.value != oldEmailPrimary) {

                            const increment = firebase.firestore.FieldValue.increment(1);
                            data.emailUpdateCount = increment;

                            const password = prompt("Please enter your current password");

                            if (!password.length) {
                                return false;
                            }

                            let status = await Auth.changeEmail(password, emailPrimary.value);

                            if (status) {
                                if (emailUpdateCount) {
                                    if (emailUpdateCount == 1) {
                                        console.log('You only have two more chances left to change your current email')
                                    } else if (emailUpdateCount == 2) {
                                        console.log('You only 1 more chance left to change your current email');
                                    } else {
                                        console.log(`You reached the limit of changing email address. 
														You can\'t change your email address anymore'`);
                                        return false;
                                    }
                                }

                                status = await _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data);
                                if (status) {
                                    oldEmailPrimary = emailPrimary.value;
                                    oldEmailSecondary = emailSecondary.value;
                                    oldMobilePrimary = mobilePrimary.value;
                                    oldMobileSecondary = mobileSecondary.value;
                                    console.log('Update successful');
                                    _profileView.updateContact(data);
                                    return true;
                                }

                            }

                        } else {
                            const status = await _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data);

                            if (status) {
                                oldEmailPrimary = emailPrimary.value;
                                oldEmailSecondary = emailSecondary.value;
                                oldMobilePrimary = mobilePrimary.value;
                                oldMobileSecondary = mobileSecondary.value;
                                console.log('Update successful');
                                _profileView.updateContact(data);
                                return true;
                            }
                        }

                        return false;

                    } catch (e) {
                        console.log(e.message);
                        return false;
                    }
                })();
            }
            //}

        }, function() {

            if (emailPrimary.value.length == 0 && oldEmailPrimary.length) {
                emailPrimary.value = oldEmailPrimary;
            }

            if (emailSecondary.value.length == 0 && oldEmailSecondary.length) {
                emailSecondary.value = oldEmailSecondary;
            }

            if (mobilePrimary.value.length == 0 && oldMobilePrimary.length) {
                mobilePrimary.value = oldMobilePrimary;
            }

            if (mobileSecondary.value.length == 0 && oldMobileSecondary.length) {
                mobileSecondary.value = oldMobileSecondary;
            }

            return false;
        });
    }

    const _initBasicInfoModalEvents = () => {
        const elements = document.getElementsByName('radio-group');
        let checkedButton;
        let oldValue;

        if (_state.gender) {
            oldValue = _state.gender;

            if (_state.gender == 'male') {
                document.querySelector('#form-basic #gender #male').checked = true;
            } else if (_state.gender == 'female') {
                document.querySelector('#form-basic #gender #female').checked = true;
            } else {
                document.querySelector('#form-basic #gender #other').checked = true;
            }
        }

        let selectStartYear = document.querySelector('#bday .year');
        let selectStartMonth = document.querySelector('#bday .month');
        let selectStartDay = document.querySelector('#bday .day');

        let startDate = new DateComponent(selectStartYear, selectStartMonth, selectStartDay);

        _initModalEvents('#modal-basic', '#edit-basic', '#form-basic', function() {
            let data = {};

            elements.forEach(e => {
                if (e.checked) {
                    checkedButton = e.value;
                }
            });

            data.gender = checkedButton;

            if (!((selectStartYear.value == 'empty' &&
                        selectStartMonth.value == 'empty' &&
                        selectStartDay.value == 'empty') ||
                    (selectStartYear.value != 'empty' &&
                        selectStartMonth.value != 'empty' &&
                        selectStartDay.value != 'empty'))) {
                console.log('Incomplete fields');
                return false;
            } else {

                if (selectStartYear.value != 'empty' &&
                    selectStartMonth.value != 'empty' &&
                    selectStartDay.value != 'empty') {
                    data.birthday = {
                        year: selectStartYear.value,
                        month: selectStartMonth.value,
                        day: selectStartDay.value
                    }
                }
            }

            if (oldValue == data.gender &&
                Object.keys(data.birthday).length === 0 && data.birthday.constructor === Object) {
                console.log('No changes');
                return false;
            } else {
                return _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data)
                    .then(() => {
                        console.log('Update successful');
                        _profileView.updateBday(data.birthday);
                        return true;
                    }).catch(err => {
                        console.log(err.message);
                        return false;
                    });
            }

        });
    }

    const _initModalEvents = (modalRef, editRef, formRef, onSave, onFinish) => {
        const modal = document.querySelector(modalRef);
        const edit = document.querySelector(editRef);
        const close = document.querySelector(`${modalRef} .close-btn`);
        const form = document.querySelector(formRef);
        const save = document.querySelector(`${modalRef} .save`);
        const cancel = document.querySelector(`${modalRef} .cancel`);

        edit.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        close.addEventListener('click', () => {
            modal.style.display = 'none';
            if (typeof onFinish == 'function') {
                if (onFinish()) {
                    form.reset();
                }
            } else {
                form.reset();
            }
        });

        cancel.addEventListener('click', () => {
            modal.style.display = 'none';
            if (typeof onFinish == 'function') {
                if (onFinish()) {
                    form.reset();
                }
            } else {
                form.reset();
            }
        });


        save.addEventListener('click', () => {
            (async () => {
                const status = await onSave();
                if (status) {
                    modal.style.display = 'none';
                    if (typeof onFinish == 'function') {
                        if (onFinish()) {
                            form.reset();
                        }
                    } else {
                        form.reset();
                    }
                }
            })();
        });

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
                form.reset();
            }
        }
    }

    //////////////////////

    const _initViews = () => {
        const overView = new OverviewComponent(_state);
        overView.render();

        _initChatStatus(_state);

        const tabs = document.querySelector('#tabs');
        if (firebase.auth().currentUser.uid == _state.uid) {
            tabs.innerHTML = `
				<ul>
					<li class="active" data-content="tab-1">My Profile</li>
					<li data-content="tab-2">My Connections</li>
					<li data-content="tab-3">Services</li>
					<li data-content="tab-4">Account Settings</li>
				</ul>`;
        } else {
            tabs.innerHTML = `
				<ul>
					<li class="active" data-content="tab-1">Profile</li>
					<li data-content="tab-2">Connections</li>
					<li data-content="tab-3">Services</li>
				</ul>`;
        }
        const content = document.querySelector('#tab-content');
        _initProfile();
        _initConnections();
    }

    const _initProfile = () => {
        _profileView = new ProfileComponent(_state);
        _profileView.render();
        if (firebase.auth().currentUser.uid == _state.uid) {
            _initEducationModalEvents();
            _initBioModalEvents();
            _initWorkplaceModalEvents();
            _initAddressModalEvents();
            _initContactModalEvents();
            _initBasicInfoModalEvents();
        }
    }

    const initSuggestions = async () => {
        const suggestionsView = new SuggestionsComponent(_state);
        const users = await _userModel.getAllUsersExcept(_state.uid);
        const suggestions = await _userModel.fetchNotFollowingUsers(users);
        suggestionsView.render(suggestions);
        initSuggestionsEvents();
    }

    const _initConnections = async () => {
        try {
            const p_connectionsView = new ConnectionComponent(_state);

            const following = await _userModel.getAllFollowing(_state.uid);
            const followingUsers = await _userModel.fetchMembers(following);

            if (followingUsers) {
                p_connectionsView.render('following', followingUsers);
            }

            const follower = await _userModel.getAllFollowers(_state.uid);
            const followerUsers = await _userModel.fetchMembers(follower);

            if (followerUsers) {
                p_connectionsView.render('follower', followerUsers);
            }

        } catch (e) {
            console.log(e);
        }
    }

    const _initTabEvents = () => {
        const tabs = document.querySelectorAll('#tabs li');
        tabs.forEach(tab => {
            tab.addEventListener('click', e => {
                const currentTab = e.target;
                View.addActive(currentTab);
                const contentId = currentTab.dataset.content;
                const tabContent = document.querySelector(`#${contentId}`);
                if (contentId != _contentId) {
                    document.querySelector(`#${_contentId}`).style.display = 'none';
                }
                const suggestions = document.querySelector('#suggestions');
                if (suggestions) {
                    if (contentId != HOME_TAB) {
                        suggestions.style.display = 'none';
                    } else {
                        suggestions.style.display = 'block';
                    }
                }

                tabContent.style.display = 'flex';
                _contentId = contentId;
            });
        });
    }

   const initSuggestionsEvents = () => {
        const suggestions = document.querySelectorAll('#suggestions ul li .avatar');
        suggestions.forEach(user => {
            user.addEventListener('click', e => {
                const id = e.target.parentElement.getAttribute('id');
                _router.changePath(`/profile/${id}`);
            });
        });
        const follow = document.querySelectorAll('#suggestions ul li .follow');
        follow.forEach(user => {
            user.addEventListener('click', e => {
                e.preventDefault();
                const id = e.target.parentElement.getAttribute('id');
                _userModel.follow(firebase.auth().currentUser.uid.trim(), id.trim()).then(() => {
                    user.setAttribute('src', '');
                    console.log('followed ' + id)
                }).catch(err => {
                    console.log(err.message);
                });
            });
        });
    }

    const _initChatStatus = async (user) => {
        try {
            let invitation = await _chatModel.getInvitation(firebase.auth().currentUser.uid, user.uid);

            let chat = document.querySelector('#profile-overview .chat');

            if (invitation.length > 0) {
                invitation = invitation[0];
                if (invitation.accept) {
                    chat.setAttribute('src', 'src/assets/message.png');
                    chat.dataset.chat = 'chat';

                } else {
                    chat.setAttribute('src', 'src/assets/pending.png');
                    chat.dataset.chat = 'pending';
                }
            }

            if (chat) {
                chat.addEventListener('click', e => {
                    (async () => {
                        try {
                            if (chat.dataset.chat == 'invite') {
                                let status = await _chatModel.invite(firebase.auth().currentUser.uid, user.uid);
                                if (status) {
                                    chat.setAttribute('src', 'src/assets/pending.png');
                                    chat.dataset.chat = 'pending';
                                }
                            } else if (chat.dataset.chat == 'chat') {
                                if (firebase.auth().currentUser.uid != user.uid) {
                                    const currentUser = await _userModel.getUser(firebase.auth().currentUser.uid);
                                    if (currentUser &&
                                        (currentUser.groups || currentUser.groups.length) &&
                                        (user.groups || user.groups.length)) {
                                        const groups = Util.getMatchesFromArray(currentUser.groups, user.groups);
                                        if (groups.length > 0) {
                                            const groupId = groups[0];
                                            _router.navigate(`/chat/${groupId}`);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    })();
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    return class Profile {
        constructor(state, router) {
            _state = state;
            _router = router;

            _contentId = HOME_TAB;
            const currentTab = document.querySelector('#tabs li');
            View.addActive(currentTab);

            const logout = document.querySelector('#logout');
            logout.addEventListener('click', () => {
            	firebase.auth().signOut()
            	.then(() => {
            		const path = '/login';
            		View.removeMenu();
            		_router.navigate('/login');
                    location.reload(true);
            		localStorage.clear();
            		sessionStorage.clear();
            	}).catch(err => {
            		console.log(err.message);
            	});
            });

            _initViews();
            _initTabEvents();

        }
    }
});