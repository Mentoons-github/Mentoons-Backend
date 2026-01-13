const mongoose = require("mongoose");

const behaviouralItemSchema = {
  value: { type: String, default: "" },
  note: { type: String, default: "" },
};

const addictionItemSchema = {
  present: { type: Boolean, default: false },
  frequency: { type: String, default: "" },
  duration: { type: String, default: "" },
  observations: { type: String, default: "" },
};

const dataCaptureSchema = new mongoose.Schema(
  {
    psychologist: {
      type: mongoose.Types.ObjectId,
      ref: "Employees",
    },
    demographic: {
      child: {
        name: { type: String, default: "" },
        age: { type: Number, default: "" },
        dateOfBirth: { type: String, default: "" },
        gender: { type: String, default: "" },
        languages: { type: [String], default: [] },
        adress: { type: String, default: "" },
        economicStatus: { type: String, default: "" },
        class: { type: Number, default: "" },
        school: { type: String, default: "" },
        religion: { type: String, default: "" },
        culture: { type: String, default: "" },
        sibilings: { type: [String], default: [] },
      },
      guardians: {
        fathersName: { type: String, default: "" },
        fathersOccupation: { type: String, default: "" },
        fatherscontact: { type: Number, default: "" },
        fatherIncome: { type: Number, default: "" },
        fatherPovertyLine: { type: String, default: "" },
        mothersName: { type: String, default: "" },
        mothersOccupation: { type: String, default: "" },
        mothercontact: { type: Number, default: "" },
        motherIncome: { type: Number, default: "" },
        motherPovertyLine: { type: String, default: "" },
        primaryCareGiver: { type: String, default: "" },
        familyStructure: { type: String, default: "" },
        familyStructureOther: { type: String, default: "" },
        map: { type: String, default: "" },
      },
    },

    developmental: {
      speech: { type: String, default: "" },
      motorSkills: { type: String, default: "" },
      socialInteraction: { type: String, default: "" },
      medicalIllness: { type: String, default: "" },
      learningDisability: { type: String, default: "" },
      currentMedication: { type: String, default: "" },
      sleepPattenrn: { type: String, default: "" },
    },

    academic: {
      performance: { type: String, default: "" },
      strugglesIn: { type: String, default: "" },
      attentionIssues: { type: String, default: "" },
      relationship: { type: String, default: "" },
      participation: { type: String, default: "" },
      behaviouralConcerns: { type: String, default: "" },
    },

    familyEnvironmental: {
      parentingStyle: { type: String, default: "" },
      screenExposure: { type: String, default: "" },
      socialInteraction: { type: String, default: "" },
      recentLifeEvents: { type: String, default: "" },
      fightsAtHome: { type: String, default: "" },
    },

    behaviouralEmotional: {
      aggressionOrTemper: behaviouralItemSchema,
      anxietyOrWorry: behaviouralItemSchema,
      moodSwings: behaviouralItemSchema,
      withdrawalOrIsolation: behaviouralItemSchema,
      hyperactivityOrRestlessness: behaviouralItemSchema,
      lyingOrStealing: behaviouralItemSchema,
      bullyingOrGetsBullied: behaviouralItemSchema,
    },

    ScreenAndDigitalAddication: {
      parentPerspective: {
        screenTime: { type: String, default: "" },
        typeOfScreenUsage: { type: [String], default: [] },
        irritatedIfDiviceTakenAway: { type: String, default: "" },
        sneakingPhoneUseSecretly: { type: String, default: "" },
        impactObserved: { type: [String], default: [] },
      },
      childPerspective: {
        enjoyMost: { type: String, default: "" },
        dailyScreenSpend: { type: String, default: "" },
        fellDeviceTakeAway: { type: String, default: "" },
        canSpendDayWithoutMobile: { type: String, default: "" },
        hobbiesAppartFromScreens: { type: String, default: "" },
      },
    },

    otherAddictionPattern: {
      gamingAddiction: addictionItemSchema,
      youtubeOrOttBinge: addictionItemSchema,
      sugarOrJunkFoodCravings: addictionItemSchema,
      nailBaitingOrHairPulling: addictionItemSchema,
      socialMediaScrolling: addictionItemSchema,
      pornExposure: addictionItemSchema,
    },

    childsSelfPerception: {
      likesThemselves: { type: [String], default: [] },
      wantToImprove: { type: [String], default: [] },
      makeThemHappy: { type: String, default: "" },
      fearOrWorries: { type: String, default: "" },
    },

    goalsAndExpectations: {
      parentsGoals: { type: [String], default: [] },
      childsGoals: { type: [String], default: [] },
    },

    therapistInitialObservation: {
      childBehaviourDuringSession: { type: String, default: "" },
      reportBuildingLevel: { type: String, default: "" },
      initialImpressionRisks: { type: String, default: "" },
      recomentedInventionPlan: { type: String, default: "" },
      sessionRequired: { type: Number, default: "" },
      activitiesOrModulesSuggested: { type: String, default: "" },
      parentalGuidanceOrBoundariesNeeded: { type: String, default: "" },
    },

    reviewMechanism: {
      type: {
        psychologist: { type: String, required: true },
        childName: { type: String, required: true },
        age: { type: String, required: true },
        date: { type: String, required: true },
        stepsTaken: { type: String, required: true },
        progressEffectivenessRating: { type: String, required: true },

        observableProgressIndicators: {
          emotionalRegulation: { type: String, required: true },
          behaviourAtHome: { type: String, required: true },
          behaviourAtSchool: { type: String, required: true },
          attentionAndFocus: { type: String, required: true },
          socialInteraction: { type: String, required: true },
          notes: { type: String, required: true },
        },

        whyInventionsWorking: {
          relatedToMentoonsProvider: {
            reasons: { type: [String], required: true },
            otherReason: { type: String, required: true },
            remarks: { type: String, required: true },
          },
          relatedToChild: {
            reasons: { type: [String], required: true },
            otherReason: { type: String, required: true },
            remarks: { type: String, required: true },
          },
        },

        evaluationSummary: { type: String, required: true },
        actionPlanOrNextSteps: { type: [String], required: true },
        plannedChangesOrRecommendations: { type: String, required: true },
        signature: { type: String, default: null },
      },
      default: null,
    },
  },
  { timestamps: true }
);

const DataCapture = mongoose.model("DataCapture", dataCaptureSchema);
module.exports = DataCapture;
