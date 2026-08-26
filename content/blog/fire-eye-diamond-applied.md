---
title: The Diamond Model and the FireEye Cyberattack
date: 2024-01-18
tags: ['hack', 'security']
excerpt: "Running the 2020 FireEye breach through the Diamond Model, and what it says about who can actually deter state-sponsored attacks."
---

In December 2020 FireEye reported that foreign government hackers had taken its red-team tools — the software it uses to test and strengthen its clients' defenses. A security company had its own offensive toolkit stolen, which is a bad day for the company and a worse one for everyone downstream of it.

The Diamond Model of Intrusion Analysis is a useful way to take that apart. It looks at an intrusion along four vertices: adversary, capability, infrastructure, and victim.

## Adversary

FireEye attributed the attack to nation-state espionage, with strong indications pointing to Cozy Bear (APT29), a group linked to Russia's Foreign Intelligence Service. APT29 was also implicated in the SolarWinds attack earlier that year.

The motive is straightforward. Stealing tools built to find weaknesses in real systems is an upgrade to your own arsenal, obtained at a fraction of the cost of building it.

## Capability

APT29 is not an average group. Spear phishing with self-extracting archive attachments, Cobalt Strike rootkits, custom malware including WellMess and WellMail, and stealthy command-and-control — including issuing commands over Twitter.

## Infrastructure

The infrastructure is built to blend in. HAMMERTOSS malware pulls commands from Twitter accounts. Type 2 infrastructure routes exfiltration indirectly. Ordinary service providers — ISPs, domain registrars — carry traffic that looks unremarkable. Traditional detection struggles because nothing about it looks out of place.

## Victim

FireEye was targeted for two things: government customer data, useful for broader espionage, and the red-team tools themselves.

## The part companies cannot solve

A private company can harden itself. It cannot deter a nation-state. That asymmetry is the actual lesson of the breach, and it is not one that better security products fix.

There are starting points — the Council of Europe Convention on Cybercrime, the Shanghai Cooperation Organization's cybersecurity initiative, the ASEAN Declaration to Prevent and Combat Cybercrime. None of them squarely addresses state-sponsored attacks. Until something does, the defending party in these incidents is structurally outmatched, and analysis like the Diamond Model tells us precisely who we are losing to without telling us how to stop them.
