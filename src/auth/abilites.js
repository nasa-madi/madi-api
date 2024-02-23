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
      can("create", "users");

    default:
      can("read",   "tools");
      can("create", "tools");
      
      can("create", "chats");

      can("read", "users", {id: user.id});
      cannot("update", "users")
      cannot("delete", "users");
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