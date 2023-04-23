import { registerHelper } from "discourse-common/lib/helpers";
import { isEmpty } from "@ember/utils";

registerHelper("getXid", function ([currentUser]) {
  if (!isEmpty(currentUser)) {
    return currentUser.associated_account_ids &&
      currentUser.associated_account_ids.siwe
      ? currentUser.associated_account_ids.siwe
      : currentUser.primary_email.email;
  } else {
    return "";
  }
});

registerHelper("replace", function ([sourceString, find, replace]) {
  return sourceString
    ? `${window.location.origin}/${sourceString.replace(find, replace)}`
    : "";
});

registerHelper("isLenghtGreaterThanZero", function (value) {
  return value > 0;
});

registerHelper("statementPosition", function ([value1, value2]) {
  return Number(value1) - Number(value2) + 1;
});

registerHelper('includesTopic', function([str]) {
  return str.includes('topic');
});