import { Ability, AbilityBuilder, createAliasResolver } from "@casl/ability";

const resolveAction = createAliasResolver({
  update: "patch",
  read: ["get", "find"],
  delete: "remove"
});




const defineRules = (can, cannot, user) => {
  switch (user.role) {

    case "superadmin":
      can("manage", "all");
      break;

    case "admin":
      can("manage", "chunks");
      can("manage", "uploads");
      can("manage", "pipelines");
      can("manage", "tools");
      can("manage", "documents");
      can("manage", "chats");

      // basically manage everything except deleting and patching users
      can("read", "users");
      can("create", "users");

    // eslint-disable-next-line no-fallthrough
    default:
      can("read", "chunks");

      can("read",   "tools");
      can("create", "tools");

      can('read', 'pipelines');
      can('read', 'pipelines/:id');
      can('create', 'pipelines');
      can('create', 'pipelines/:id');

      can("read",   "documents");
      can("create", "documents");
      can("update", "documents", {userId: user.id});
      can("delete", "documents", {userId: user.id});
      
      can("create", "chats");

      can("read", "users", {id: user.id});
      cannot("update", "users")
      cannot("delete", "users");

      
      can("create", "uploads");
      can("read", "uploads");
      

      can("upload-parse-chunk", "pipelines", {
        userString: {$in: ["all", user.id]}, // can always upload to own path or to all
        pluginString: {$in: ["all", ...(user.allowedManagedPlugins||[])]} // can always upload to all plugins or to allowed plugins
      });
      //TODO: Add allowedPlugins permissions column to users table

      can("read", "uploads", {
        userString: {$in: ["all", user.id]},
        pluginString: {$in: ["all", ...(user.allowedPlugins||[])]}
      });
      //TODO: Add allowedPlugins permissions column to users table

      break;
  }
};

export const defineRulesFor = (user) => {
  const { can, cannot, rules } = new AbilityBuilder(Ability);
  defineRules(can, cannot, user);
  return rules;
};

export const defineAbilitiesFor = (user) => {
  const rules = defineRulesFor(user);
  return new Ability(rules, { resolveAction });
};