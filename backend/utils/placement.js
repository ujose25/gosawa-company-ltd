function withPlacement(application) {
  if (!application || application.status !== "accepted") {
    return application;
  }

  return {
    ...application,
    placement: {
      companyName: application.company_name,
      companyLocation: application.company_location || application.location || null,
      opportunity: application.title,
      contact: application.company_email || null,
    },
  };
}

module.exports = { withPlacement };
