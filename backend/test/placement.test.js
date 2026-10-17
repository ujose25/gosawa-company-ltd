const test = require("node:test");
const assert = require("node:assert/strict");
const { withPlacement } = require("../utils/placement");

test("adds placement details only after an application is accepted", () => {
  const pending = withPlacement({
    status: "pending",
    title: "IT Intern",
    company_name: "Kigali Tech",
  });
  const accepted = withPlacement({
    status: "accepted",
    title: "IT Intern",
    company_name: "Kigali Tech",
    company_location: "Kigali",
    company_email: "hr@kigali.tech",
    location: "Gasabo",
  });

  assert.equal(pending.placement, undefined);
  assert.deepEqual(accepted.placement, {
    companyName: "Kigali Tech",
    companyLocation: "Kigali",
    opportunity: "IT Intern",
    contact: "hr@kigali.tech",
  });
});
