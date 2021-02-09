define([
    'view',
    'overviewComponent',
    'profileComponent',
    'p_connectionsComponent',
    'u_postComponent',
    'modalComponent',
    'userModel',
    'chatModel',
    'postModel',
    'util',
    'validator',
    'dateComponent',
    'authController',
    'uuid',
    'css!css/profile',
], (View,
    OverviewComponent,
    ProfileComponent,
    ConnectionComponent,
    PostComponent,
    ModalComponent,
    UserModel,
    ChatModel,
    PostModel,
    Util,
    Validator,
    DateComponent,
    Auth,
    uuid) => {

    const _userModel = new UserModel(firebase.firestore(), firebase.auth());
    const _chatModel = new ChatModel(firebase.firestore());
    const _postModel = new PostModel(firebase.firestore());

    let _profileView;
    let _selected;
    const HOME_TAB = 'tab-1';

    let _router;
    let _state

    ////////////////////// edit events


    const _initBioModalEvents = () => {
        const ref = document.querySelector('#modal-bio');
        const edit = document.querySelector('#edit-bio');
        const form = document.querySelector('#form-bio');
        const modal = new ModalComponent(ref, form, edit);

        const text = document.querySelector("#form-bio textarea");
        let oldText = _state.bio.trim();
        if (_state.bio) {
            text.value = _state.bio.trim();
        }

        const wordCount = document.querySelector("#count #current");
        wordCount.innerText = text.value.length;
        const limit = 600;

        text.addEventListener("keyup", function() {
            const characters = text.value.trim().split('');
            wordCount.innerText = characters.length;

            if (characters.length > limit) {
                text.value = text.value.trim().substring(0, limit);
                wordCount.innerText = limit;
            }
        });

        modal.onSave(async() => {
            return 
                if (text.value.trim().length == 0) {
                    console.log('Empty field');
                    return false;
                } else if (oldText.trim() == text.value.trim()) {
                    console.log('No changes');
                    return false;
                } else {
                    try {
                        const status = await _userModel
                            .mergeUpdateUser(firebase.auth().currentUser.uid, { bio: text.value.trim() });

                        if (status) {
                            console.log('Update successful');
                            _profileView.updateBio(text.value.trim());
                            oldText = text.value.trim();
                            return true;
                        }

                        return false;
                    } catch (e) {
                        console.log(e);
                        return false;
                    }
                }
  
        }, function() {
            if (text.value.trim().length == 0 && oldText.trim().length) {
                text.value = oldText.trim();
            }
            return false;
        });

        modal.onCancel(function() {
            if (text.value.trim().length == 0 && oldText.trim().length) {
                text.value = oldText.trim();
            }
            return false;
        });

        modal.onClose(function() {
            if (text.value.trim().length == 0 && oldText.trim().length) {
                text.value = oldText.trim();
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

        const ref = document.querySelector('#modal-education');
        const edit = document.querySelector('#edit-education');
        const form = document.querySelector('#form-education');
        const modal = new ModalComponent(ref, form, edit);

        modal.onSave(function() {

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

        const ref = document.querySelector('#modal-workplace');
        const edit = document.querySelector('#edit-workplace');
        const form = document.querySelector('#form-workplace');
        const modal = new ModalComponent(ref, form, edit);

        modal.onSave(function() {
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
        const ref = document.querySelector('#modal-address');
        const edit = document.querySelector('#edit-address');
        const form = document.querySelector('#form-address');
        const modal = new ModalComponent(ref, form, edit);

        modal.onSave(function() {
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
        const emailSecondary = document.querySelector('#email-secondary');
        const mobilePrimary = document.querySelector('#mobile-primary');
        const mobileSecondary = document.querySelector('#mobile-secondary');

        const provider = firebase.auth().currentUser.providerData[0].providerId;

        if (_state.email[1]) {
            emailSecondary.value = _state.email[1];
        }

        if (_state.mobile && _state.mobile[0]) {
            mobilePrimary.value = _state.mobile[0];
        }

        if (_state.mobile && _state.mobile[1]) {
            mobileSecondary.value = _state.mobile[1];
        }

        let oldEmailSecondary = emailSecondary.value;
        let oldMobilePrimary = mobilePrimary.value;
        let oldMobileSecondary = mobileSecondary.value;

        const ref = document.querySelector('#modal-contact');
        const edit = document.querySelector('#edit-contact');
        const form = document.querySelector('#form-contact');
        const modal = new ModalComponent(ref, form, edit);

        modal.onSave(async () => {
            let data = {};
            data.email = ['', ''];
            data.mobile = ['', ''];

           
            data.email[0] = firebase.auth().currentUser.email;

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

            if (oldEmailSecondary == emailSecondary.value &&
                oldMobilePrimary == mobilePrimary.value &&
                oldMobileSecondary == mobileSecondary.value
            ) {
                console.log('No changes!!');
                return false;
            }

            if (!data.email.length && !data.mobile.length) {
                console.log('no valid data')
                return false;
            } else {
           
                try {
                    const status = await _userModel.mergeUpdateUser(firebase.auth().currentUser.uid, data);

                    if (status) {
                        oldEmailSecondary = emailSecondary.value;
                        oldMobilePrimary = mobilePrimary.value;
                        oldMobileSecondary = mobileSecondary.value;
                        console.log('Update successful');
                        _profileView.updateContact(data);
                        return true;
                    }

                    return false;

                } catch (e) {
                    console.log(e.message);
                    return false;
                 }
           
            }
        }, function() {
          

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

        modal.onClose(function() {

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

        modal.onCancel(function() {

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

        const ref = document.querySelector('#modal-basic');
        const edit = document.querySelector('#edit-basic');
        const form = document.querySelector('#form-basic');
        const modal = new ModalComponent(ref, form, edit);
        modal.onSave(function() {
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
                (data.birthday != undefined &&
                    Object.keys(data.birthday).length === 0 && data.birthday.constructor === Object)) {
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

    //////////////////////

    const _initViews = () => {
        const overView = new OverviewComponent(_state);
        overView.render();

        _initChatStatus(_state);

        const tabs = document.querySelector('#tabs');
        if (firebase.auth().currentUser.uid == _state.uid) {
            tabs.innerHTML = `
                <ul>
                    <li class="active" data-content="tab-1">My Timeline</li>
                    <li data-content="tab-2">About</li>
                    <li data-content="tab-3">My Connections</li>
                    <li data-content="tab-4">Services</li>
                    <li data-content="tab-5">Account Settings</li>
                </ul>`;
        } else {
            tabs.innerHTML = `
                <ul>
                    <li class="active" data-content="tab-1">Timeline</li>
                    <li data-content="tab-2">About</li>
                    <li data-content="tab-3">Connections</li>
                    <li data-content="tab-4">Services</li>
                </ul>`;
        }
        _initTimeline();
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

    const _initConnections = async () => {
        try {

            const following = await _userModel.fetchMembersFromFollowing(_state.uid, ORDER, 7);
            const follower = await _userModel.fetchMembersFromFollowers(_state.uid, ORDER, 7);
            const view = new ConnectionComponent(_state);

            for(let user of following){
                const image = await _userModel.getUserImage(user.uid);
                if(image.length){
                    user.photoURL = image[0].url;
                }
            }

            for(let user of follower){
                const image = await _userModel.getUserImage(user.uid);
                if(image.length){
                    user.photoURL = image[0].url;
                }
            }

            if (following.length) {
                view.setFollowing(following);
                view.render();
            }

            if (follower.length) {
                view.setFollower(follower);
                view.render();
            }

            if (!following.length && !follower.length) {
                const container = document.querySelector('#connections');
                if (_state.uid == firebase.auth().currentUser.uid) {
                    container.innerHTML = `<p>You haven't connected to anyone</p>`;
                } else {
                    container.innerHTML = `<p>${_state.name} hasn't connected to anyone</p>`;
                }

            }

        } catch (e) {
            console.log(e);
        }
    }

    const _initTabEvents = () => {
        let _contentId = HOME_TAB;

        let currentTab = document.querySelector('#tabs li');
        View.addActive(currentTab);

        const tabs = document.querySelectorAll('#tabs li');
        tabs.forEach(tab => {
            tab.addEventListener('click', e => {
                currentTab = e.target;
                View.addActive(currentTab);

                const contentId = currentTab.dataset.content;
                const tabContent = document.querySelector(`#${contentId}`);

                if (contentId != _contentId) {
                    const oldTab = document.querySelector(`#${_contentId}`);
                    if (oldTab.classList.contains('flex-container')) {
                        oldTab.classList.remove('flex-container');
                    }
                    oldTab.classList.add('remove');
                }

                if (tabContent.classList.contains('remove')) {
                    tabContent.classList.remove('remove');
                    tabContent.classList.add('flex-container');
                }
                _contentId = contentId;
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
                chat.addEventListener('click', async (e) => {
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
                                        _router.navigate(`chat/${groupId}`);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    const _initTimeline = async () => {
        PostComponent.init(_state, _router);
        const container = document.querySelector('#profile-section');
        PostComponent.renderModal(container);

        PostComponent.initWritePost();

        PostComponent.clearListeners();
        try {
            let posts = [];

            // get all posts user 
            let postListener;
            const container = document.querySelector('#timeline');
            let ref;
            if (_state.uid == firebase.auth().currentUser.uid) {
                ref = _postModel.prepareAllByDate(_state.uid, ORDER)
            } else {
                ref = _postModel.prepareAllByDate(_state.uid, ORDER)
                    .where('privacy', '==', PUBLIC);
            }

            postListener = ref.onSnapshot(querySnapshot => {
                let posts = [];
                let flag;
                querySnapshot.docChanges().forEach(change => {
                    if (change.type == 'added') {
                        const post = change.doc.data();
                        let component = new PostComponent(post);
                        posts.push(component);
                    } else if (change.type == 'modified') {
                        const post = change.doc.data();
                        PostComponent.updatePostView(post);
                    }
                    flag = change.type;
                });

                if (posts.length) {
                    try {
                        posts.sort(function(post1, post2) {
                            return post1.post.timestamp.toDate() - post2.post.timestamp.toDate();
                        });

                        posts.forEach(async (post) => {
                            const image = await _userModel.getUserImage(post.post.user.uid);
                            if(image.length){
                                post.post.user.photoURL = image[0].url;
                            }
                            post.render(container)
                                .likeObserver()
                                .unfollowObserver()
                                .hidePostObserver()
                                .deleteObserver()
                                .avatarObserver()
                                .editObserver()
                                .messageObserver();
                            await post.commentObserver();
                        });


                    } catch (e) {
                        console.log(e);
                    }

                } else {
             
                    if (flag != 'modified' && flag != 'removed') {
                        if (_state.uid == firebase.auth().currentUser.uid) {
                            container.innerHTML = `<p>You haven't post anything on your timeline</p>`;

                        } else {
                            let gender;
                            if (_state.gender == 'male') {
                                gender = 'his';
                            } else if (_state.gender == 'female') {
                                gender = 'her';
                            }

                            container.innerHTML = `<p>${_state.name} hasn't post anything on
                                ${(gender)?gender:'its'} timeline</p>`;
                        }
                    }
                }
            });
            PostComponent.listeners(postListener);

        } catch (e) {
            console.log(e.message);
        }
    }


    return class Profile {
        constructor(state, router) {
            _state = state;
            _router = router;

            const logout = document.querySelector('#logout');
            logout.addEventListener('click', () => {
                firebase.auth().signOut()
                    .then(() => {
                        const path = 'login';
                        View.removeMenu();
                        _router.navigate('login');
                        location.reload(true);
                        localStorage.clear();
                        sessionStorage.clear();
                    }).catch(err => {
                        console.log(err.message);
                    });
            });

            _initViews();
            _initTabEvents();

            const uploadBtn = document.querySelector('.p-image');
            const uploadImage = document.querySelector('.file-upload');

            if(uploadBtn){
                uploadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if(_state.uid == firebase.auth().currentUser.uid){
                        uploadImage.click();
                    }else{
                        console.log('You have no permission to upload image');
                    }
                });
            }
            
            if(uploadImage){
                uploadImage.addEventListener('change', () => {
                    if (uploadImage.files && uploadImage.files[0]) {
                        const images = document.querySelectorAll('.profile-image');
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            images.forEach(image => {
                                image.setAttribute('src',  e.target.result);
                            });

                            upload(uploadImage.files[0]);
                        }
                         
                        reader.readAsDataURL(uploadImage.files[0]);
                    }
                });
            }

            const upload = (file) => {
                const imageId = uuid();
                const task = firebase.storage().ref(`profile/${firebase.auth().currentUser.uid}/${imageId}.png`).put(file);

                task.on('state_changed', function(snapshot){
                    const progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                    console.log(progress)
                }, function(error){
                    console.log(error.message)
                }, function(){
                    task.snapshot.ref.getDownloadURL().then(async (url) =>{
                        let id = await _userModel.setProfileImage(firebase.auth().currentUser.uid, {
                            url:url,
                            name:imageId
                            });
                        if(id){
                            const status = await _userModel
                            .mergeUpdateUser(firebase.auth().currentUser.uid, { photoId: id});

                            if(status){
                                console.log('Profile image updated.');
                            }else{
                                console.log('Unable to update image.');
                            }
                        }else{
                            console.log('Unable to upload image.');
                        }
    
                    });
                });
            }

        }
    }
});