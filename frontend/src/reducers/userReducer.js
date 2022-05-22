export function user(state = null, action) {
    switch (action.type) {
        case "LOGIN_USER":
            return action.payload;
        case "VALIDATE_USER":
            console.log(action);
            return action.payload;
        case "UPDATE_DETAILS":
            return action.payload;
        case "LOGOUT_USER":
            return null;
        default:
            return state;
    }
}