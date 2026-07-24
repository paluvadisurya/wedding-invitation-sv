/* ============================================================================
 *  COPY — every word on the site that is not a name, a date or a place.
 *
 *  Edit freely. Nothing here is referenced by ID from code in a way that will
 *  break if you rewrite the sentence; only the keys matter.
 * ========================================================================== */

export const copy = {
  invitation: {
    /** Sits above the names, small and tracked out. */
    overline: 'With the blessings of both our families',
    /** Under the names. Two short lines, no more. */
    lede: 'are getting married,\nand would like you there.',
    scrollCue: 'Follow the thread',
  },

  confluence: {
    eyebrow: 'The five days',
    title: 'Two towns.\nOne thread.',
    /**
     * The single most important paragraph on the site: it explains why the
     * schedule looks the way it does.
     */
    lede: 'Until the 25th of August there are two weddings happening at once — Srivalli’s in Wanaparthy, Surya’s in Vinukonda, three hundred kilometres apart, mirroring each other morning for morning. On the 25th they meet. Most guests will only see one side of this page, and that is exactly as it should be.',
    phase: {
      prelude: {
        title: 'Before',
        note: 'Both families, in one city.',
      },
      parallel: {
        title: 'Apart',
        note: 'The same rites, the same hours, two towns.',
      },
      confluence: {
        title: 'Together',
        note: 'The groom’s party travels. The families meet.',
      },
      union: {
        title: 'The wedding',
        note: null,
      },
      journey: {
        title: 'Onward',
        note: 'The celebration moves to Vinukonda.',
      },
    },
    /** Filter control above the timeline. */
    filter: {
      label: 'Show me',
      all: 'Everything',
      bride: 'Srivalli’s side',
      groom: 'Surya’s side',
      hint: 'Attending only one side? Narrow the thread and the rest steps back.',
    },
    /** Designed states for missing content. Never say "TBD". */
    pending: {
      venue: 'Venue still being settled',
      time: 'Hour not yet set',
      date: 'Date not yet fixed',
      meaning: 'The family is still writing this one.',
      travel: 'Travel to be arranged',
    },
    past: 'Already happened',
    addToCalendar: 'Add to calendar',
    directions: 'Directions',
  },

  countdown: {
    eyebrow: 'The auspicious hour',
    /** Shown while the muhurtham's exact minute is unset. */
    provisional: 'The priest has not yet set the minute. This counts to sunrise on the wedding day.',
    next: 'Next',
    began: 'It has begun.',
  },

  story: {
    eyebrow: 'How this happened',
    title: 'Two families,\nchoosing each other.',
    /**
     *  ← FILL IN
     *  This is the one piece of writing we deliberately did not draft for you.
     *  It is an arranged marriage and it is worth saying so plainly and with
     *  pride — how the families met, who made the first call, what the two of
     *  you decided. Two or three short paragraphs in your own voice will be
     *  worth more than anything written for you. Set this to `null` to hide
     *  the section entirely until you are ready.
     */
    body: null as string | null,
    placeholder:
      'Srivalli and Surya are still writing this part. It will be here before the wedding.',
  },

  ceremonies: {
    eyebrow: 'What happens, and why',
    title: 'A short guide\nto the rituals',
    lede: 'If this is your first South Indian wedding: nothing here needs preparation, and there is no wrong thing to wear. Come, eat, and let someone put turmeric on your hands.',
  },

  travel: {
    eyebrow: 'Getting there',
    title: 'Two towns,\nand how to reach them',
    lede: 'Coaches leave from Hyderabad for both towns. If you are driving yourself, the notes below are written for the person actually behind the wheel at five in the morning.',
    busesTitle: 'Coaches from Hyderabad',
    stayTitle: 'Where you will sleep',
    contactsTitle: 'Who to ring',
    contactsLede: 'These are real people, awake at odd hours, whose job this week is to make sure you are not lost.',
  },

  gallery: {
    eyebrow: 'Photographs',
    title: 'The engagement,\nand what comes next',
    empty: 'The wedding photographs will appear here as they come in.',
  },

  rsvp: {
    eyebrow: 'Kindly reply',
    title: 'Will you come?',
    lede: 'Tell us which days you can make and we will make sure there is a bed, a seat on the coach, and food you can eat.',
    submit: 'Send our reply',
    sending: 'Sending…',
    thanks: 'Thank you — it is written down.',
    thanksBody: 'The family has your reply. If anything changes, send it again and the later reply wins.',
    error: 'That did not send. Try once more, or message the coordinator below.',
    fields: {
      name: 'Your name',
      namePlaceholder: 'The name your invitation came in',
      attending: 'Can you make it?',
      yes: 'Yes, we will be there',
      no: 'We cannot, but we send our blessings',
      party: 'How many of you, including yourself?',
      whichEvents: 'Which days?',
      whichEventsHint: 'Pick as many as you like. Most guests come to one side.',
      travel: 'How will you travel?',
      travelOptions: {
        busWanaparthy: 'Coach from Hyderabad to Wanaparthy',
        busVinukonda: 'Coach from Hyderabad to Vinukonda',
        own: 'Making our own way',
        unsure: 'Not sure yet',
      },
      stay: 'Will you need a room?',
      stayOptions: {
        yes: 'Yes, please',
        no: 'No, we have somewhere',
        unsure: 'Not sure yet',
      },
      diet: 'Anything we should know about food?',
      dietPlaceholder: 'Allergies, no onion or garlic, jain, a fussy toddler…',
      note: 'Anything else?',
    },
  },

  blessings: {
    eyebrow: 'For the couple',
    title: 'Leave them\nsomething to keep',
    lede: 'A line, a blessing, an old story about one of them. These are read out loud, so keep that in mind.',
    field: 'Your blessing',
    fieldPlaceholder: 'Write something they will still want to read in twenty years.',
    from: 'From',
    submit: 'Leave it',
    thanks: 'Left. Thank you.',
    empty: 'Nobody has written yet. Be first.',
  },

  footer: {
    /**  ← FILL IN  a line about gifts or blessings, if you want one at all. */
    gifts: null as string | null,
    madeFor: 'For Srivalli and Surya',
  },
} as const;
