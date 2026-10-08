# Advantage Project Governance

This document outlines the governance structure, roles, and processes for the Advantage open-source project. Our goal is to create a transparent, inclusive, and effective community that advances the mission of standardizing high-impact display advertising on the web.

## Table of Contents

- [Project Mission & Values](#project-mission--values)
- [Governance Structure](#governance-structure)
- [Roles and Responsibilities](#roles-and-responsibilities)
  - [Maintainers](#maintainers)
  - [Contributors](#contributors)
  - [Supporting Members](#supporting-members)
- [Maintainer Responsibilities](#maintainer-responsibilities)
- [Decision-Making Process](#decision-making-process)
- [Maintainer Meetings](#maintainer-meetings)
- [Project Management & Communication](#project-management--communication)
- [Becoming a Maintainer](#becoming-a-maintainer)
- [Maintainer Expectations](#maintainer-expectations)
- [Maintainer Emeritus](#maintainer-emeritus)
- [Conflict Resolution](#conflict-resolution)
- [Amendment Process](#amendment-process)

## Project Mission & Values

Advantage's mission is to simplify and standardize high-impact display advertising on the web and to democratize high-impact web advertising for all stakeholders in the digital advertising ecosystem.

Our core values are:
- **Security & Transparency**: Building trust through secure, open practices
- **Standardization**: Simplifying buying and selling of high-impact display advertising
- **Community First**: Development benefits the community as a whole
- **Openness**: Welcoming contributions from all stakeholders
- **Quality**: Maintaining high standards for code, documentation, and community interaction

## Governance Structure

The Advantage project operates under a **maintainer-driven governance model** with community input. The project is structured as follows:

```
┌─────────────────────────────────────┐
│      Maintainer Committee           │
│  (Decision-making & Oversight)      │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  Contributors  │  │ Supporting      │
│                │  │ Members         │
└────────────────┘  └─────────────────┘
```

### Maintainer Committee

The Maintainer Committee consists of all active maintainers and is responsible for:
- Strategic direction of the project
- Reviewing and merging pull requests
- Managing releases
- Maintaining project infrastructure
- Enforcing the Code of Conduct
- Making decisions about project governance

## Roles and Responsibilities

### Maintainers

**Maintainers** are trusted individuals with commit access to the repository who actively manage the project, review contributions, and ensure the project follows its mission and code of conduct.

**Types of Maintainers:**

1. **Core Maintainers**: Have full administrative access and can make decisions on all aspects of the project
2. **Area Maintainers**: Focus on specific areas (e.g., documentation, formats, messaging, CI/CD) with commit access to relevant parts of the codebase

### Contributors

**Contributors** are community members who contribute to the project through:
- Code contributions
- Documentation improvements
- Bug reports and feature requests
- Community support
- Testing and feedback

Contributors do not have commit access but are essential to the project's success.

### Supporting Members

**Supporting Members** are organizations or individuals who:
- Implement the Advantage technology
- Use Advantage standards for buying/selling
- Endorse the project's mission
- Provide resources or funding (optional)

## Maintainer Responsibilities

Maintainers are expected to:

### Code & Technical Review
- Review pull requests in a timely manner (target: within 1 week)
- Ensure contributions meet project quality standards
- Test and verify bug fixes and new features
- Maintain backward compatibility when possible
- Write and maintain tests for critical functionality
- Keep dependencies up to date and secure

### Community Management
- Respond to issues and discussions constructively
- Welcome and mentor new contributors
- Enforce the Code of Conduct fairly and consistently
- Foster an inclusive and positive community environment
- Help triage and prioritize issues

### Documentation & Communication
- Maintain up-to-date documentation
- Communicate changes and decisions transparently
- Participate in maintainer discussions
- Document architectural decisions
- Update changelog and release notes

### Project Health
- Monitor project metrics (issues, PRs, community engagement)
- Identify and address technical debt
- Plan and execute releases
- Ensure CI/CD pipelines are functioning
- Maintain security best practices

### Time Commitment
- While we understand maintainers are often volunteers, we expect:
  - Regular check-ins on the project (at least bi-weekly)
  - Participation in critical decisions
  - Transparent communication about availability
  - Proactive notification if extended absence is needed

## Decision-Making Process

### Consensus-Seeking

The Advantage project follows a **consensus-seeking decision-making process**:

1. **Proposal**: Any maintainer or contributor can propose changes via GitHub issues or discussions
2. **Discussion**: Open discussion period (minimum 72 hours for minor changes, 1 week for major changes)
3. **Consensus Building**: Maintainers work to reach consensus through discussion
4. **Resolution**: 
   - If consensus is reached, the decision is implemented
   - If consensus cannot be reached, a simple majority vote of core maintainers decides
   - For critical decisions (governance changes, major architectural changes), 2/3 majority of core maintainers is required

### Decision Levels

**Minor Decisions** (Fast-track, 72 hours):
- Bug fixes
- Documentation updates
- Dependency updates
- Minor feature additions

**Major Decisions** (Standard, 1 week):
- New features or formats
- Breaking changes
- Architectural changes
- New maintainer appointments

**Critical Decisions** (Extended, 2 weeks):
- Governance changes
- Code of Conduct changes
- Major architectural rewrites
- Maintainer removal

### Emergency Decisions

In case of security issues or critical bugs, any core maintainer can make immediate decisions and implement fixes. These must be communicated to all maintainers within 24 hours.

## Maintainer Meetings

### Monthly Maintainer Meetings

The maintainer committee holds regular monthly meetings on the **first Wednesday of each month** to:
- Review project status and health metrics
- Discuss pending decisions and proposals
- Plan upcoming releases
- Address technical debt and infrastructure needs
- Review maintainer nominations
- Coordinate on major initiatives
- Share knowledge and best practices

**Meeting Details:**
- **When**: First Wednesday of each month
- **Duration**: 60 minutes
- **Format**: Video call (link shared with maintainers)
- **Notes**: Published in GitHub Discussions after each meeting
- **Attendance**: All maintainers encouraged to attend; async updates welcome

**Meeting Agenda Template:**
1. Welcome and roll call
2. Review action items from previous meeting
3. Project metrics and health review
4. Decision items requiring vote
5. Technical discussions
6. Community updates
7. New business and open floor
8. Action items and next steps

Community members are welcome to propose agenda items by commenting on the meeting issue in GitHub Discussions at least 24 hours before the meeting.

### Ad-Hoc Meetings

Additional meetings may be called as needed for:
- Urgent security issues
- Time-sensitive decisions
- Planning major releases
- Conflict resolution

## Project Management & Communication

### GitHub Projects - Public Roadmap

We use **GitHub Projects** to maintain transparency and keep the community informed:

**Public Roadmap**: [High Impact JS Roadmap](https://github.com/orgs/high-impact-js/projects)
- **Planned**: Features and improvements we're considering
- **In Progress (WIP)**: Active development work
- **Shipped**: Completed features and fixes

This gives everyone visibility into:
- What we're working on
- What's coming next
- What we've recently delivered
- How to contribute to specific initiatives

### GitHub Discussions - Shape the Future

**[GitHub Discussions](https://github.com/high-impact-js/highimpact.js/discussions)** is our primary forum for community conversation and collaboration.

**Discussion Categories:**
- **💡 Ideas**: Propose new features and improvements
- **🗳️ Polls**: Vote on proposals and gather community input
- **🙏 Q&A**: Ask questions and get help
- **📣 Announcements**: Stay updated on releases and news
- **🎨 Show and Tell**: Share your implementations and use cases
- **🔬 Research**: Discuss technical explorations and experiments

**We especially encourage discussions about:**
- Standards and specifications for high-impact formats
- Implementation challenges and solutions
- Best practices and patterns
- Integration with ad tech ecosystem
- Performance and security considerations

Your participation helps shape the future of high-impact advertising on the web!

### Who We Welcome

Advantage welcomes contributions from all stakeholders in the digital advertising ecosystem:

#### 📰 Publishers
- **Implement** Advantage on your properties
- **Share** integration challenges and solutions
- **Improve** performance and user experience
- **Provide** real-world testing and feedback
- **Document** implementation patterns

#### 🎯 Agencies & Advertisers
- **Share** campaign requirements and use cases
- **Provide** feedback on format capabilities
- **Identify** gaps in current standards
- **Contribute** creative best practices
- **Help** prioritize features

#### 💻 Developers
- **Contribute** code improvements and bug fixes
- **Write** documentation and tutorials
- **Create** examples and demos
- **Build** integrations and tools
- **Review** pull requests

#### 🎓 Industry Experts
- **Help define** standards and specifications
- **Share** domain expertise
- **Guide** architectural decisions
- **Mentor** community members
- **Represent** industry perspectives

**Everyone's contribution matters**, whether you're:
- Fixing a typo in documentation
- Reporting a bug
- Proposing a new feature
- Reviewing someone's code
- Sharing your implementation story
- Helping answer questions in Discussions

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started!

## Becoming a Maintainer

### Eligibility Criteria

To be considered for maintainership, a contributor should demonstrate:

1. **Technical Excellence**
   - Consistent history of quality contributions (typically 5+ merged PRs)
   - Understanding of the project architecture and codebase
   - Ability to write clean, maintainable code
   - Good judgment on technical decisions

2. **Community Engagement**
   - Helpful and constructive in code reviews and discussions
   - Active participation in issue triage
   - Mentoring or helping other contributors
   - Respectful adherence to the Code of Conduct

3. **Commitment**
   - Regular contributions over at least 3 months
   - Demonstrated reliability and follow-through
   - Willingness to commit time to maintainer duties
   - Alignment with project mission and values

4. **Domain Expertise** (for Area Maintainers)
   - Deep knowledge in a specific area (formats, documentation, etc.)
   - Track record of contributions in that area

### Nomination Process

1. **Nomination**: Any current maintainer can nominate a contributor by:
   - Opening a private discussion with the maintainer committee
   - Providing evidence of the nominee's contributions and qualifications
   - Explaining the value the nominee would bring to the team

2. **Self-Nomination**: Contributors may also nominate themselves by:
   - Sending an email to community@get-advantage.org
   - Including a summary of contributions and reasons for interest
   - Expressing areas of interest and commitment level

3. **Evaluation Period**: 
   - The maintainer committee reviews the nomination
   - Existing maintainers may ask questions or request more information
   - Evaluation period: 1-2 weeks

4. **Decision**:
   - Simple majority vote of core maintainers
   - Decision communicated to the nominee privately
   - If approved, public announcement and onboarding begins
   - If declined, constructive feedback provided with path forward

5. **Onboarding**:
   - Grant repository access (appropriate level)
   - Add to maintainer communication channels
   - Pair with an existing maintainer for mentorship
   - Add to MAINTAINERS.md and all-contributors
   - Announce to the community

### Probationary Period

New maintainers (especially Core Maintainers) may start with a 3-month probationary period where:
- They have full technical access but observe major decisions
- A mentor maintainer provides guidance
- Performance and fit are evaluated
- At the end, the committee confirms or extends the probation

## Maintainer Expectations

### Code of Conduct

All maintainers must:
- Exemplify the Code of Conduct in all interactions
- Handle enforcement issues professionally and fairly
- Recuse themselves from decisions where they have conflicts of interest
- Maintain confidentiality when handling sensitive issues

### Communication

Maintainers should:
- Be responsive and transparent
- Communicate availability and time constraints
- Participate in maintainer discussions
- Keep the community informed of major decisions
- Be respectful and constructive in all communications

### Stepping Down

Maintainers who need to step down should:
- Notify the maintainer committee at least 2 weeks in advance
- Help with knowledge transfer
- Complete or hand off critical in-progress work
- Move to Maintainer Emeritus status

## Maintainer Emeritus

Maintainers who step down in good standing become **Maintainers Emeritus** and:
- Retain recognition for their contributions
- Are listed in MAINTAINERS.md with emeritus status
- Can attend maintainer discussions (without voting rights)
- Have an expedited path to return to active maintainer status
- May be consulted on important project decisions

### Returning from Emeritus

A maintainer emeritus can return to active status by:
- Expressing interest to the maintainer committee
- Demonstrating renewed commitment and availability
- Simple majority approval from core maintainers

## Inactive Maintainers

If a maintainer becomes inactive (no participation for 6+ months) without prior notice:
- The maintainer committee will attempt to contact them
- After 30 days with no response, they may be moved to emeritus status
- This is done respectfully and gratefully
- They retain the path to return as described above

## Removal of Maintainers

In rare cases, a maintainer may be removed for:
- Violation of the Code of Conduct
- Abuse of maintainer privileges
- Repeated failure to meet maintainer responsibilities
- Actions that harm the project or community

**Process:**
1. Private discussion among core maintainers
2. Attempt to resolve issues through dialogue
3. If resolution fails, 2/3 majority vote of core maintainers (excluding the person in question)
4. Private notification with explanation
5. Public announcement (details shared based on privacy and legal considerations)

## Conflict Resolution

### Levels of Conflict

1. **Contributor-to-Contributor**: Resolve directly or with maintainer mediation
2. **Contributor-to-Maintainer**: Another maintainer mediates
3. **Maintainer-to-Maintainer**: Core maintainers mediate collectively
4. **Unresolved Conflicts**: Escalate to vote following decision-making process

### Mediation Principles

- Assume good intent
- Listen actively and empathetically
- Focus on issues, not personalities
- Seek win-win solutions
- Document agreements
- Follow up to ensure resolution

## Amendment Process

This governance document can be amended by:
1. Any maintainer or community member proposing changes via GitHub issue
2. Discussion period of at least 2 weeks
3. 2/3 majority vote of core maintainers
4. Public announcement of changes
5. Update to this document with effective date

## Contact

For governance questions or concerns:
- **Email**: community@get-advantage.org
- **GitHub Discussions**: [High Impact JS Discussions](https://github.com/high-impact-js/highimpact.js/discussions)
- **Slack**: [Join our Slack](https://join.slack.com/t/high-impact-js/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ)

---

**Document Version**: 1.0  
**Effective Date**: November 2025  
**Last Updated**: November 2025
