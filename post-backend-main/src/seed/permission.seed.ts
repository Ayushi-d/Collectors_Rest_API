const UserPermissionSeed = [
  {
    key: 'DELETE_IMAGES',
    description: 'Users can delete their images',
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  },
  {
    key: 'UPLOAD_IMAGE',
    description: 'Users can upload images to their account',
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  }
];

const AdminPermissionSeed = [
  {
    key: 'FULL_ACCESS',
    description: 'Admin have full access',
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  },
];

const permission = {
  AdminPermissionSeed,
  UserPermissionSeed,
};

export default permission;
