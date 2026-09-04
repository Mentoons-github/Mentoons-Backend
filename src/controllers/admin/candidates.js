const { CandidateModel } = require("../../models/admin/candidates");
const JobApplication = require("../../models/jobApplication");
const { uploadFile } = require("../../services/FileUpload");
const asyncHandler = require("../../utils/asyncHandler");
const { CandidateEmailModel } = require("../../models/admin/candidateEmails");
const { successResponse } = require("../../utils/responseHelper");
const { sendEmail } = require("../../services/sesEmail.service");

const allExternalCandidates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const {
    search,
    jobTitle,
    location,
    minExperience,
    maxExperience,
    status,
    source,
    keySkills,
    department,
    industry,
    category,
    emailed,
  } = req.query;

  const filter = {};
  const andConditions = [];

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    andConditions.push({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
        { mobile: regex },
        { jobTitle: regex },
        { keySkills: regex },
        { currentEmployer: regex },
        { currentDesignation: regex },
      ],
    });
  }

  if (jobTitle && jobTitle.trim()) {
    andConditions.push({ jobTitle: new RegExp(jobTitle.trim(), "i") });
  }

  if (location && location.trim()) {
    andConditions.push({ currentLocation: new RegExp(location.trim(), "i") });
  }

  if (department && department.trim()) {
    andConditions.push({ department: new RegExp(department.trim(), "i") });
  }

  if (industry && industry.trim()) {
    andConditions.push({ industry: new RegExp(industry.trim(), "i") });
  }

  if (category && category.trim()) {
    andConditions.push({ category: new RegExp(category.trim(), "i") });
  }

  if (status && status.trim()) {
    andConditions.push({ status: status.trim() });
  }

  if (source && source.trim()) {
    andConditions.push({ source: source.trim() });
  }

  if (emailed !== undefined && emailed !== "") {
    andConditions.push({ emailed: emailed === "true" });
  }

  if (keySkills && keySkills.trim()) {
    const skillRegexes = keySkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => new RegExp(s, "i"));
    if (skillRegexes.length > 0) {
      andConditions.push({ keySkills: { $in: skillRegexes } });
    }
  }

  if (minExperience !== undefined || maxExperience !== undefined) {
    const expCondition = {};
    if (minExperience !== undefined && minExperience !== "") {
      expCondition.$gte = parseFloat(minExperience);
    }
    if (maxExperience !== undefined && maxExperience !== "") {
      expCondition.$lte = parseFloat(maxExperience);
    }
    if (Object.keys(expCondition).length > 0) {
      andConditions.push({ totalExperienceYears: expCondition });
    }
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  const [candidates, count] = await Promise.all([
    CandidateModel.find(filter).skip(skip).limit(limit),
    CandidateModel.countDocuments(filter),
  ]);

  const data = {
    candidates,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    totalCount: count,
  };

  return successResponse(res, 200, "Candidates fetched successfully", data);
});

const COMPANY_NAME = "Mentoons";
const COMPANY_ADDRESS =
  "399, 2nd Cross Rd, opposite the Paul hotel, HBCS Colony, Amarjyoti Layout, Domlur, Bengaluru, Karnataka 560071";
const COMPANY_WEBSITE = "https://mentoons.com/";
const COMPANY_EMAIL = "info@mentoons.com";
const COMPANY_PHONE = "+91 78928 58593";
const COMPANY_LOGO_URL =
  "https://mentoons-website.s3.ap-northeast-1.amazonaws.com/logo/ec9141ccd046aff5a1ffb4fe60f79316.png";

const RECIPIENT_MODELS = {
  candidate: CandidateModel,
  jobApplication: JobApplication,
};

const buildUnsubscribeFooter = (recipientEmail, recipientType) => {
  const unsubscribeUrl = `${process.env.SERVER_BASE_URL.replace(/\/$/, "")}/candidate/unsubscribe?email=${encodeURIComponent(
    recipientEmail,
  )}&recipientType=${encodeURIComponent(recipientType)}`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e5e7eb;">
      <tr>
        <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
          <img src="${COMPANY_LOGO_URL}" alt="${COMPANY_NAME}" width="120" style="display:block;margin:0 0 12px 0;max-width:120px;height:auto;" />
          <p style="margin:0 0 4px 0;font-weight:bold;color:#374151;">${COMPANY_NAME}</p>
          <p style="margin:0 0 4px 0;">${COMPANY_ADDRESS}</p>
          <p style="margin:0 0 4px 0;">
            <a href="${COMPANY_WEBSITE}" target="_blank" rel="noopener noreferrer" style="color:#6b7280;text-decoration:underline;">${COMPANY_WEBSITE}</a>
            &nbsp;|&nbsp;
            <a href="mailto:${COMPANY_EMAIL}" style="color:#6b7280;text-decoration:underline;">${COMPANY_EMAIL}</a>
            &nbsp;|&nbsp;
            ${COMPANY_PHONE}
          </p>
          <p style="margin:8px 0 0 0;">
            You're receiving this email from ${COMPANY_NAME}.
            <a href="${unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  `;
};

const sendCandidateEmailByRecipients = async (req, res) => {
  try {
    const requestedTo = []
      .concat(req.body["to[]"] || req.body.to || [])
      .filter(Boolean);
    const { subject, body, linkUrl } = req.body;

    const recipientType =
      req.body.recipientType === "jobApplication"
        ? "jobApplication"
        : "candidate";
    const RecipientModel = RECIPIENT_MODELS[recipientType];

    const isTestMode =
      process.env.EMAIL_TEST_MODE === "true" || req.body.testMode === true;
    const TEST_EMAIL = "devanps313@gmail.com";

    const attachmentsPlaced = req.body.attachmentsPlaced === "true";

    const attachmentIds = []
      .concat(req.body["attachmentIds[]"] || req.body.attachmentIds || [])
      .filter(Boolean);

    if (requestedTo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one recipient is required",
      });
    }

    if (!body || !body.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Email body is required" });
    }

    const unsubscribed = await RecipientModel.find({
      email: { $in: requestedTo },
      unsubscribed: true,
    }).distinct("email");
    const unsubscribedSet = new Set(unsubscribed);

    const to = requestedTo.filter((email) => !unsubscribedSet.has(email));
    const skipped = requestedTo.filter((email) => unsubscribedSet.has(email));

    if (to.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All selected recipients have unsubscribed",
        skipped,
      });
    }

    const uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const uploaded = await uploadFile(
          file.buffer,
          "candidate-emails",
          file.mimetype,
          file.originalname,
        );

        uploaded.attachmentId = attachmentIds[i];
        uploadedAttachments.push(uploaded);
      }
    }

    const imageAttachments = uploadedAttachments.filter((a) =>
      a.mimetype.startsWith("image/"),
    );
    const fileAttachments = uploadedAttachments.filter(
      (a) => !a.mimetype.startsWith("image/"),
    );

    const trimmedLinkUrl = linkUrl?.trim();

    const unplacedImageAttachments = imageAttachments.filter(
      (a) => !attachmentsPlaced || !a.attachmentId,
    );
    const unplacedFileAttachments = fileAttachments.filter(
      (a) => !attachmentsPlaced || !a.attachmentId,
    );

    let attachmentsHtml = "";

    if (unplacedImageAttachments.length > 0) {
      attachmentsHtml += unplacedImageAttachments
        .map((a) => {
          const img = `<img src="${a.url}" alt="${a.originalName}" style="max-width:100%;border-radius:4px;" />`;
          return trimmedLinkUrl
            ? `<p><a href="${trimmedLinkUrl}" target="_blank" rel="noopener noreferrer">${img}</a></p>`
            : `<p>${img}</p>`;
        })
        .join("");
    }

    if (unplacedFileAttachments.length > 0) {
      attachmentsHtml += `<p><br></p><p><strong>Attachments:</strong></p><ul>${unplacedFileAttachments
        .map(
          (a) =>
            `<li><a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.originalName}</a></li>`,
        )
        .join("")}</ul>`;
    }

    let processedBody = body;

    if (uploadedAttachments.length > 0) {
      for (const uploaded of uploadedAttachments) {
        if (!uploaded.attachmentId) continue;

        const wrapperRegex = new RegExp(
          `(<span[^>]*data-attachment-id="${uploaded.attachmentId}"[^>]*>)([\\s\\S]*?)(<\\/span>)`,
          "g",
        );

        processedBody = processedBody.replace(
          wrapperRegex,
          (match, openTag, inner, closeTag) => {
            let newInner = inner;
            if (uploaded.mimetype.startsWith("image/")) {
              newInner = newInner.replace(
                /(<img[^>]*src=")[^"]*(")/,
                `$1${uploaded.url}$2`,
              );
            } else {
              newInner = newInner.replace(
                /(<a[^>]*href=")[^"]*(")/,
                `$1${uploaded.url}$2`,
              );
            }
            return `${openTag}${newInner}${closeTag}`;
          },
        );
      }
    }

    const recipientDocs =
      recipientType === "candidate"
        ? await CandidateModel.find({ email: { $in: to } })
        : [];
    const candidatesByEmail = new Map();
    for (const doc of recipientDocs) {
      const key = doc.email.toLowerCase();
      if (!candidatesByEmail.has(key)) candidatesByEmail.set(key, []);
      candidatesByEmail.get(key).push(doc);
    }

    const results = [];
    const sentTo = [];
    const emailLogs = [];

    for (const recipientEmail of to) {
      const footer = buildUnsubscribeFooter(recipientEmail, recipientType);
      const finalHtml = attachmentsPlaced
        ? processedBody + attachmentsHtml + footer
        : body + attachmentsHtml + footer;

      const actualRecipient = isTestMode ? TEST_EMAIL : recipientEmail;
      const testSubjectPrefix = isTestMode
        ? `[TEST → was: ${recipientEmail}] `
        : "";

      const mailOptions = {
        from: '"Mentoons HR Team" <hr@mentoons.com>',
        to: actualRecipient,
        subject: `${testSubjectPrefix}${subject?.trim() || "Message from Mentoons"}`,
        html: finalHtml,
      };

      const sendResult = await sendEmail(mailOptions);
      const wasSent = Boolean(sendResult && sendResult.success);

      if (!wasSent) {
        console.error(
          `Failed to send ${recipientType} email to ${actualRecipient}${
            isTestMode ? ` (test mode, real target: ${recipientEmail})` : ""
          }:`,
          sendResult?.error,
        );
      }

      results.push({
        email: recipientEmail,
        deliveredTo: actualRecipient,
        sent: wasSent,
        messageId: sendResult?.messageId,
        error: wasSent ? undefined : sendResult?.error,
      });

      if (recipientType === "candidate") {
        const matchingCandidates =
          candidatesByEmail.get(recipientEmail.toLowerCase()) || [];

        for (const candidateDoc of matchingCandidates) {
          emailLogs.push({
            candidate: candidateDoc._id,
            email: recipientEmail.toLowerCase(),
            subject: subject?.trim() || "Message from Mentoons",
            body: finalHtml,
            linkUrl: trimmedLinkUrl || undefined,
            attachments: uploadedAttachments,
            sentBy: req.admin?._id,
            status: wasSent ? "sent" : "failed",
            testMode: isTestMode || undefined,
          });
        }
      }

      if (wasSent) sentTo.push(recipientEmail);
    }

    if (emailLogs.length > 0) {
      await CandidateEmailModel.insertMany(emailLogs);
    }

    if (sentTo.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
        results,
        skipped,
      });
    }

    if (!isTestMode) {
      await RecipientModel.updateMany(
        { email: { $in: sentTo } },
        {
          $set: { emailed: true, lastEmailedAt: new Date() },
          $inc: { emailCount: 1 },
        },
      );
    }

    return res.status(200).json({
      success: true,
      testMode: isTestMode || undefined,
      message: `${sentTo.length} sent, ${results.length - sentTo.length} failed${
        skipped.length ? `, ${skipped.length} skipped (unsubscribed)` : ""
      }${isTestMode ? " (TEST MODE — all delivered to " + TEST_EMAIL + ")" : ""}`,
      attachments: uploadedAttachments,
      skipped,
      results,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

const getCandidateEmailHistory = asyncHandler(async (req, res) => {
  const { email, candidateId } = req.query;

  if (!candidateId && (!email || !email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Email or candidateId is required",
    });
  }

  const query = candidateId
    ? { candidate: candidateId }
    : { email: email.trim().toLowerCase() };

  const emails = await CandidateEmailModel.find(query).sort({
    createdAt: -1,
  });

  return successResponse(res, 200, "Candidate email history fetched", {
    emails,
  });
});

const emailInbox = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;

  const { search, filterType } = req.query;

  const preMatch = {
    email: { $exists: true, $nin: [null, ""] },
  };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    preMatch.$or = [{ name: regex }, { email: regex }, { jobTitle: regex }];
  }

  const sortBeforeGroupStage = { $sort: { updatedAt: -1, _id: -1 } };

  const groupStage = {
    $group: {
      _id: { $toLower: "$email" },
      candidateId: { $first: "$_id" },
      name: { $first: "$name" },
      email: { $first: "$email" },
      jobTitle: { $first: "$jobTitle" },
      emailed: { $max: { $cond: [{ $eq: ["$emailed", true] }, 1, 0] } },
      lastEmailedAt: { $max: "$lastEmailedAt" },
      emailCount: { $sum: { $ifNull: ["$emailCount", 0] } },
    },
  };

  const normalizeStage = {
    $addFields: {
      emailed: { $eq: ["$emailed", 1] },
    },
  };

  const postMatch = {};
  if (filterType === "mailed") {
    postMatch.emailed = true;
  } else if (filterType === "not_mailed") {
    postMatch.emailed = false;
  } else if (filterType === "recent") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    postMatch.emailed = true;
    postMatch.lastEmailedAt = { $gte: sevenDaysAgo };
  }

  const sortStage =
    filterType === "recent"
      ? { lastEmailedAt: -1 }
      : { emailed: -1, lastEmailedAt: -1, name: 1 };

  const basePipeline = [
    { $match: preMatch },
    sortBeforeGroupStage,
    groupStage,
    normalizeStage,
    ...(Object.keys(postMatch).length > 0 ? [{ $match: postMatch }] : []),
  ];

  const [rows, countResult] = await Promise.all([
    CandidateModel.aggregate([
      ...basePipeline,
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: "$candidateId",
          name: 1,
          email: 1,
          jobTitle: 1,
          emailed: 1,
          lastEmailedAt: 1,
          emailCount: 1,
        },
      },
    ]),
    CandidateModel.aggregate([...basePipeline, { $count: "total" }]),
  ]);

  const totalCount = countResult[0]?.total || 0;

  return successResponse(res, 200, "Inbox fetched successfully", {
    candidates: rows,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  });
});

const unsubscribeCandidate = async (req, res) => {
  try {
    const { email, recipientType } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).send("<p>Missing email address.</p>");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const RecipientModel =
      recipientType === "jobApplication" ? JobApplication : CandidateModel;

    await RecipientModel.updateMany(
      { email: normalizedEmail },
      { $set: { unsubscribed: true, unsubscribedAt: new Date() } },
    );

    return res.status(200).send(`
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:60px 20px;color:#374151;">
          <h2>You've been unsubscribed</h2>
          <p>${email} will no longer receive emails from Mentoons.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return res
      .status(500)
      .send("<p>Something went wrong. Please try again later.</p>");
  }
};

module.exports = {
  sendCandidateEmailByRecipients,
  unsubscribeCandidate,
  allExternalCandidates,
  getCandidateEmailHistory,
  emailInbox,
};
