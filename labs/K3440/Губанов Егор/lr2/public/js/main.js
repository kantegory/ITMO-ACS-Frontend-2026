import {
    renderHeader,
    showError
} from './ui.js';

import { initAuth } from './auth.js';

import {
    initCatalog,
    initTraining
} from './catalog.js';

import { initProfile } from './profile.js';
import { initSession } from './session.js';
import { initBlog } from './blog.js';

const pages = {
    catalog: initCatalog,
    training: initTraining,
    profile: initProfile,
    session: initSession,
    blog: initBlog,
    login: initAuth,
    register: initAuth
};

renderHeader();

try {
    await pages[document.body.dataset.page]?.();
} catch (error) {
    showError(error);
}