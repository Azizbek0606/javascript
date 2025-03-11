import { db } from './path_db.js';
export function getGroups() {
    const groups = db.prepare("SELECT * FROM image_group").all();
    return groups.length ? groups : null;
}
