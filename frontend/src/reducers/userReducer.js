export function user(state = null, action) {
    console.log(action.type, action.payload);
    switch (action.type) {
        case "LOGIN_USER":
            return action.payload;
        case "VALIDATE_USER":
            return action.payload;
        case "UPDATE_PROFILE":
            console.log(action);
            return action.payload;
        case "LOGOUT_USER":
            return null;
        default:
            return state;
    }
}