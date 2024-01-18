import { AbilityBuilder, createMongoAbility, createAliasResolver } from "@casl/ability";
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load permissions from the YAML file located in the same folder
const permissionsPath = path.join(__dirname, 'permissions.yml');
const permissions = yaml.load(fs.readFileSync(permissionsPath, 'utf8'));

const resolveAction = createAliasResolver({
  update: "patch",
  read: ["get", "find"],
  delete: "remove"
});

const isBuilder = (user) => (role) => user.role && user.role === role;

export const defineRulesFor = (user) => {
  const { can, cannot, rules } = new AbilityBuilder(createMongoAbility);
  const is = isBuilder(user);

  // Iterate over the permissions and define rules based on user role
  for (const role in permissions) {
    if (is(role)) {
      for (const subject in permissions[role]) {
        permissions[role][subject].forEach((permission) => {
          const action = permission.action;
          const conditions = permission.conditions ? { ...permission.conditions, id: user.id } : undefined;
          const fields = permission.fields;
          const method = permission.method || 'can';

          if (method === 'can') {
            can(action, subject, conditions);
          } else if (method === 'cannot') {
            cannot(action, subject, fields, conditions);
          }
        });
      }
    }
  }

  return rules;
};

export const defineAbilitiesFor = (user) => {
  const rules = defineRulesFor(user);

  return new createMongoAbility(rules, { resolveAction });
};