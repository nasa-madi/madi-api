// src/services/authentication/authentication.abilities.ts
import {  AbilityBuilder, createMongoAbility, createAliasResolver } from "@casl/ability";

// don't forget this, as `read` is used internally
const resolveAction = createAliasResolver({
  update: "patch", // define the same rules for update & patch
  read: ["get", "find"], // use 'read' as a equivalent for 'get' & 'find'
  delete: "remove" // use 'delete' or 'remove'
});

const isBuilder = (user)=>(role)=>user.role && user.role === role

export const defineRulesFor = (user) => {
  // also see https://casl.js.org/v6/en/guide/define-rules
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);
  const is = isBuilder(user)

  // SuperAdmin can do evil
  if (is("superadmin")) can("manage", "all");
  if (is("superadmin")) return rules;

  if (is("admin")) can("create", "users");


  can("read", "tools");
  can("create", "tools");

  can("create", "chats");

  can("read", "users");
  can("update", "users", { id: user.id });
  cannot("update", "users", ["roleId"], { id: user.id });
  cannot("delete", "users", { id: user.id });

  return rules;
};

export const defineAbilitiesFor = (user) => {
  const rules = defineRulesFor(user);

  return new createMongoAbility(rules, { resolveAction });
};