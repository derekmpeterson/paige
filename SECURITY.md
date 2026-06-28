# Security Policy

## Supported versions

Paige is an actively developed project; security fixes are applied to the latest
release on the `main` branch. There is no long-term support for older versions.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report them privately:

- Email **derek@derekp.com**, or
- Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  ("Report a vulnerability" under the repository's **Security** tab).

Please include:

- A description of the issue and its potential impact.
- Steps to reproduce, or a proof of concept.
- Any suggested remediation, if you have one.

You can expect an acknowledgement within a few days. Once the issue is confirmed and
fixed, we will coordinate disclosure with you.

## Scope notes

Paige is designed as a **single-user, self-hosted** application. It ships without
authentication or rate limiting and stores parsed books in memory (see the
[Limitations & design notes](README.md#limitations--design-notes) in the README). If
you deploy it on a public network, you are responsible for placing it behind
appropriate access controls.
