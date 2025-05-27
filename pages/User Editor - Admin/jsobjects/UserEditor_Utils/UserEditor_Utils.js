export default {
  getUniqueRoles(usersData) {
    const uniqueRoles = new Set();

    usersData.forEach(user => {
      if (user.Roles) {
        const rolesArray = user.Roles.split(',');
        rolesArray.forEach(role => {
          const trimmedRole = role.trim();
          if (trimmedRole) {
            uniqueRoles.add(trimmedRole);
          }
        });
      }
    });

    const roleOptions = Array.from(uniqueRoles).map(role => ({
      label: role,
      value: role
    }));

    return JSON.stringify(roleOptions);
  },
};