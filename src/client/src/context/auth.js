import React, { useContext, useState } from "react";

export const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// function AuthProvider({children}) {

//   return (
//     <AuthContext.Provider
//         value={{
//             token: token,
//             data: data,
//             setAuthTokens: setTokens,
//             setData: setData,
//         }}
//     >
//       {children}
//    </AuthContext.Provider>
// );
// }

// export {AuthProvider}
