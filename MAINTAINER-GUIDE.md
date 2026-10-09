# Maintainer Quick Reference Guide

A quick reference for Advantage maintainers. For complete details, see [GOVERNANCE.md](GOVERNANCE.md).

## 🎯 Quick Links

- [GOVERNANCE.md](GOVERNANCE.md) - Full governance documentation
- [MAINTAINERS.md](MAINTAINERS.md) - Current maintainer roster
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributor guidelines
- [CODE-OF-CONDUCT.md](CODE-OF-CONDUCT.md) - Code of conduct
- [GitHub Issues](https://github.com/high-impact-js/highimpact.js/issues)
- [GitHub PRs](https://github.com/high-impact-js/highimpact.js/pulls)
- [GitHub Projects](https://github.com/orgs/high-impact-js/projects) - Public roadmap
- [Discussions](https://github.com/high-impact-js/highimpact.js/discussions)
- [Slack Community](https://join.slack.com/t/high-impact-js/shared_invite/zt-2gy6c4z4m-4~pIuwRfe8eqPM5H7iV9MQ)

## 📅 Maintainer Meetings

**Monthly Meeting**: First Wednesday of each month
- Review project health and metrics
- Vote on pending decisions
- Plan releases and roadmap
- Discuss technical architecture
- Review maintainer nominations

**Meeting notes** are published in GitHub Discussions after each meeting.

Community members can propose agenda items 24 hours before the meeting.

## ⏱️ Response Time Expectations

- **Pull Requests**: Within 1 week
- **Issues**: Acknowledge within 3 days, full response within 1 week
- **Security Issues**: Within 24 hours
- **Community Questions**: Within 2-3 days

## ✅ PR Review Checklist

- [ ] Code follows project style and conventions
- [ ] Tests included and passing
- [ ] Documentation updated (if needed)
- [ ] Changelog updated (for significant changes)
- [ ] No breaking changes (or properly documented/discussed)
- [ ] Commits are clear and descriptive
- [ ] CI/CD checks passing
- [ ] Author has signed CLA (if applicable)

## 🏷️ Issue Triage Labels

**Type:**
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `question` - Further information requested

**Priority:**
- `critical` - Urgent, blocks major functionality
- `high` - Important, should be addressed soon
- `medium` - Standard priority
- `low` - Nice to have

**Status:**
- `needs-repro` - Needs reproduction steps
- `needs-fix` - Confirmed, ready for implementation
- `in-progress` - Someone is working on it
- `blocked` - Cannot proceed yet

**Other:**
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `wontfix` - Will not be addressed
- `duplicate` - Already exists

## 📝 Decision-Making Guide

### Minor Decisions (72 hours)
- Bug fixes
- Documentation updates
- Dependency updates
- Minor feature additions

**Process:** Post in issue/PR, allow 72 hours for feedback, proceed with consensus or majority.

### Major Decisions (1 week)
- New features or formats
- Breaking changes
- Architectural changes
- New maintainer appointments

**Process:** Create discussion or issue, allow 1 week, seek consensus, vote if needed (simple majority).

### Critical Decisions (2 weeks)
- Governance changes
- Code of Conduct changes
- Major architectural rewrites
- Maintainer removal

**Process:** Create discussion, allow 2 weeks, require 2/3 majority of core maintainers.

### Emergency (Immediate)
- Security vulnerabilities
- Critical bugs affecting users

**Process:** Any core maintainer can act immediately, notify all maintainers within 24 hours.

## 🔐 Security Issue Handling

1. **DO NOT** discuss publicly in issues
2. Acknowledge receipt within 24 hours
3. Direct reporter to security email: operations@get-advantage.org
4. Coordinate fix privately with maintainers
5. Create CVE if needed
6. Prepare security advisory
7. Release fix ASAP
8. Public disclosure after fix is available

## 💬 Communication Templates

### Welcoming New Contributors

```markdown
Thanks for your first contribution to Advantage! 🎉

We really appreciate your help. A maintainer will review your PR soon. In the meantime, please make sure:
- All tests pass
- You've followed our [contributing guidelines](CONTRIBUTING.md)
- Your commits are descriptive

Welcome to the community! 🚀
```

### Requesting Changes

```markdown
Thanks for this contribution! I've reviewed the code and have a few suggestions:

[specific feedback]

Once these are addressed, I'll be happy to merge this. Let me know if you have questions!
```

### Closing Stale Issues

```markdown
This issue has been inactive for 6 months. If this is still relevant, please comment and we'll reopen. Otherwise, we'll close it to keep the issue tracker manageable.

You can always reopen or create a new issue if needed. Thanks!
```

### Declining a Proposal

```markdown
Thank you for this thoughtful proposal. After discussion among maintainers, we've decided not to pursue this because [specific reasons].

We appreciate your understanding and hope you'll continue contributing to the project in other ways!
```

## 🎓 Mentoring New Maintainers

When onboarding a new maintainer:

1. **Welcome them** publicly and in maintainer channels
2. **Grant access** to repositories and communication channels
3. **Assign a mentor** (existing maintainer)
4. **Start small** - first few reviews as co-reviewer
5. **Check in regularly** - weekly for first month
6. **Be available** for questions
7. **Recognize success** - celebrate their first solo merge!

## 🔄 Regular Maintainer Tasks

### Weekly
- [ ] Review new PRs and issues
- [ ] Respond to mentions and questions
- [ ] Check CI/CD health
- [ ] Update GitHub Projects (move cards, update status)

### Monthly
- [ ] Attend monthly maintainer meeting (first Wednesday)
- [ ] Review open issues and PRs for staleness
- [ ] Update dependencies if needed
- [ ] Review project metrics (stars, forks, engagement)
- [ ] Update roadmap in GitHub Projects
- [ ] Participate in maintainer discussions

### Quarterly
- [ ] Review and update documentation
- [ ] Plan releases
- [ ] Evaluate contributor growth
- [ ] Consider governance improvements
- [ ] Review and update GitHub Projects roadmap

## 🤝 Conflict Resolution

When conflicts arise:

1. **Assume good intent** - Most conflicts are misunderstandings
2. **Listen actively** - Understand all perspectives
3. **Focus on issues** - Not personalities
4. **Take it offline** - Move heated discussions to private channels
5. **Seek mediation** - Ask another maintainer to help
6. **Document resolution** - Record agreements
7. **Follow up** - Ensure resolution holds

## 🚪 Taking a Break

If you need to step away:

1. **Communicate early** - Let other maintainers know ASAP
2. **Set timeline** - Expected duration of absence
3. **Hand off work** - Transfer critical responsibilities
4. **Update status** - Mark yourself as unavailable
5. **No guilt** - Life happens, we understand!

To go on temporary leave:
- Email maintainers@get-advantage.org
- Update MAINTAINERS.md with "(On Leave)" status
- Set GitHub status

## 📞 Getting Help

**Technical Questions:**
- Ask in maintainer Slack channel
- Create a discussion in GitHub
- Pair program with another maintainer

**Governance Questions:**
- Email community@get-advantage.org
- Ask in maintainer discussions
- Consult GOVERNANCE.md

**Code of Conduct Issues:**
- Report to operations@get-advantage.org
- Involve multiple maintainers in decisions
- Keep discussions confidential

**Personal Issues/Burnout:**
- Talk to your mentor maintainer
- Consider temporary leave
- We prioritize maintainer wellbeing!

## 🎉 Recognition

Celebrate maintainer and contributor achievements:

- Thank contributors in PR comments
- Mention achievements in release notes
- Share success stories in community channels
- Nominate outstanding contributors for maintainership
- Update all-contributors regularly

## 📚 Resources

- [GitHub Maintainer Best Practices](https://opensource.guide/best-practices/)
- [Contributor Covenant](https://www.contributor-covenant.org/)
- [Open Source Guides](https://opensource.guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Questions?** Email community@get-advantage.org or ask in the maintainer channel.

**Last Updated**: November 2025
