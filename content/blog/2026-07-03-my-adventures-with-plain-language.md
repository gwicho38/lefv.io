---
title: "My Adventures with Plain Language"
date: 2026-07-03
tags: ["engineering", "design"]
excerpt: "Miller said our cognitive shelf holds seven concepts, plus or minus two. Spec-driven development is one way around that limit."
---

At this point I will call this a blog series (does two make a series?) that looks at my research into how to minimize cognitive load while improving software quality given AI slop, also known as *how do I stop crying myself to sleep because I can't read 40k lines of code per day.*

See [PR View | How it Makes PRs Great Again (for me)](/blog/pr-view) for the last article.

## How I Found `codeplain`

I had previously hinted that I was considering [\*codeplain](https://platform.codeplain.ai/). I found `codeplain` by some combination of targeted advertising and searching via `claude`. My search query was something like "deterministic code specification language."

## What Is CodePlain

In their own words `codeplain` is a spec-driven code generation platform where a `spec` is defined via `codeplain`'s `plain` language.

Here's a simple `Hello World` definition targeting `Python`:

```shell
***implementation reqs***
- :Implementation: should be in Python.

***functional specs***
- Display "hello, world"
```

Here's a more robust `Hello World` definition targeting `Java`:

```shell
---
description: '"hello, world" in Plain (Java version)'
import:
  - java-console-app-template
---

***definitions***
> There are no additional definitions needed in this module.
> For the definitions of :App: and other imported concepts,
> check https://github.com/Codeplain-ai/codeplain/tree/main/standard_template_library

***implementation reqs***
- :MainExecutableFile: of :App: should be executuable with "java -jar hello-world-1.0.jar".

***test reqs***
> Test specs are defined in the import.

***functional specs***

- Display "hello, world"

  ***acceptance tests***

  - :App: should exit with status code 0 indicating successful execution.

  - :App: should complete execution in under 1 second.
```

What this means is that for them, "specifications \[are\] the source of truth for the software's functionality." [Beyond Vibe Coding](https://blog.codeplain.ai/i/172083270/spec-driven-development-the-mature-way-forward).

<details>
<summary>A (semi) complete overview of the <code>plain</code> lang specification is here:</summary>

```text
Frontmatter (YAML, top of file):
- import — list of template modules (defs/impl-reqs/test-reqs)
- requires — list of root modules to build before this one
- description — free text
- required_concepts — concepts importer must define (import modules/templates)
- exported_concepts — concepts visible to modules that requires this one

Sections (body):
- ***definitions*** — concepts, :ConceptName: notation
- ***implementation reqs*** — HOW to build (lang, framework, arch, unit test rules)
- ***test reqs*** — conformance test rules only (framework, run cmd, mocking policy)
- ***functional specs*** — WHAT to build, chronological, ≤200 LOC each
- ***acceptance tests*** — nested under one functional spec, full-workflow verification

Concept notation:
- :ConceptName: — CamelCase, letters/digits/+/-/./_ only, must define before use, no cycles

Predefined concepts (never redefine):
:plainDefinitions: :plainImplementationReqs: :plainFunctionality: :plainTestReqs:
:Implementation: :plainImplementationCode: :UnitTests: :ConformanceTests:
:AcceptanceTest:/:AcceptanceTests:

Other elements:
- Linked resources — [text](relative/path), must be single text file on disk, one reference site only
- Template include — {% include "name.plain", var: val %}, {{ var }} substitution only
- Comments — line starting >

Module types:
- Import module (template/) — defs/impl-reqs/test-reqs only, no funcspecs, no requires
- Requires module (root level) — full module, funcspecs + everything

Project-level files:
- config.yaml — renderer config: unittests-script, conformance-tests-script,
  test-script-timeout, template-dir, logging-config-path, base-folder, copy-build,
  copy-conformance-tests, conformance-tests-dest, log-to-file, headless,
  force-render, verbose, api
- resources/ — linked resources
- test_scripts/ — scripts the config points to
```

</details>

## Why I Found `codeplain`

As I argued in my previous article:

> The upshot is that program definition interfaces should move *closer* to first principles (let's get back to building with primitives, loops and functions only!) and that production software definitions should be smaller, more rigorous, must be traceable, and must be testable.

While I am generally a bit *mad*, (I would argue that) I'm not crazy, and we know AI volume doesn't jive with human cognition.

[George Miller described it at the birth of the age of computing](https://www.brainmusic.org/EducationalActivities/MBB91WebPage/MBB91%20Webpage/Miller_memory1956.pdf), "our cognitive shelf is limited to the number 7 +/- 2" (i.e., humans can't generally hold more than 7 *concepts* at a time +/- 2):

> "My problem is that I have been persecuted by an integer. For seven years this number has followed me around, has intruded in my most private data, and has assaulted me from the pages of our most public journals"

and even more poignantly with:

> There is a clear and definite limit to the accuracy with which we can identify absolutely the magnitude of a unidimensional stimulus variable. I would propose to call this limit the span of absolute judgment, and I maintain that for unidimensional judgments this span is usually somewhere in the neighborhood of seven.

Like good studies often do, his study simply captured what intuition spells out for us. We are mammals, mammals have mammalian limits, and we should confront these limits directly, not trying to hand wave them away (also they are evidence-based, but hopefully this goes without saying).

Miller even proposed a nice model for escaping our own cognitive traps:

> We are not completely at the mercy of this limited span, however, because we have a variety of techniques for getting around it and increasing the accuracy of our judgments.
>
> The three most important of these devices are (a) to make relative rather than absolute judgments; or, if that is not possible, (b) to increase the number of dimensions along which the stimuli can differ; or (c) **to arrange the task in such a way that we make a sequence of several absolute judgments in a row.** (*emphasis added by me*)

So in the simplest way that I can put our limit is not just complexity of content, we simply have an upper bound on the sheer **volume** that we can cognize at any given moment of time. As people working with AI, our problem then extends further we have un-manageable **volume** and arguably no change (or worse) in problem complexity. Paradoxically, we're back to square one in terms of information density (a ton of information reduces to no information) but with the added result of (somehow) working software (although this is true for contracts, research, etc.).

`codeplain` has also written about information theory and cognitive load (which I recommend reading): [Problems: ambiguity and instability](https://github.com/githubnext/eea/blob/main/docs/report.md#problems-ambiguity-and-instability). They've logically connected their work to this architecture proposal: [Regenerative Software - The Phoenix Architecture](https://aicoding.leaflet.pub/3majnyfydzs2y).

I recommend reading through their blog more generally as it is edifying as to the information theory that underpins the current debate: [\*codeplain | Substack](https://blog.codeplain.ai/?sort=top).

## Why `codeplain` May Help

As I stated above, my premise is that our development canvas should now be smaller, more rigorous, and testable. In particular, I believe that in the future a good piece of software should be written like a good contract. In each case, after completion, permutations and applications are infinite (did the US Founder's thinking the Constitution would eventually resolve to the Regulatory state? did the European Steel and Coal Community envision the European Commission?).

What a good contract does is assert a logically consistent set of ideas in a logically closed loop with flexibility to change/grow while remaining coherent.

To my surprise, `codeplain` was built around this concept.

On July 3, 2026 I spoke with their CEO, `Dusan Omercevic`, and their Product Designer `Kaja Skerlj`. Mr. Omercevic gave me an idea of *how* `codeplain` works to translate the `plain` specs into working code. The thrust of our conversation however goes back to Miller's third prong for complexity mitigation: "getting around \[our complexity threshold is possible where were we\] … **to arrange the task in such a way that we make a sequence of several absolute judgments in a row**."

Therefore, what makes `plain` and spec driven specification useful is not just their ability to specify *how* our programs should work, it is in its power to define an outcome and be able to prove it via testing that is invariant to the stochasticity of the LLM. More broadly, if our tests are 100% trustworthy and our spec is 100% transparent, then I don't care, nor do I have to care about what the code that is generated in between. Not because I don't want to care (I do!), but because in a production system fully leveraging the code production throughput of ML models, I simply can't.

The next article in the series will explore actually using `plain` lang to build a proper program/integration and hopefully convince myself (and others) that the spec → test → program pipeline is real. I did however want to leave behind interesting highlights from the conversation I had with the `codeplain` team.

**`codeplain` has both generated and user injected testing:**

> Codeplain's determinism comes from its testing infrastructure, not from hoping an LLM behaves consistently. The system generates roughly 10x more conformance tests than implementation code. The compilation pipeline then uses an orchestrator to break specs into smaller pieces so LLMs can generate skeletons, code, and tests in a more controlled way.

**The entry point for adopting/using the product is integration (for now):**

Ever had to write a *shim*, or I don't know, create an adapter for various input sources that are similar but not exactly the same (e.g., like various chat clients or llm clients). Or maybe someone has had to export data in a generic way because the consumer is unknown or rapidly changing? In this case, it may be better to describe what these integrations should look like in `plain` language (I always want them to take in message streams via socket connection; I always want them to output to json objects with five properties).

Instead of writing connector code, we can write connector specs.

**Some limits that aren't limits**

`codeplain` currently supports up to about 50 functionalities, which can result in 5,000–20,000 lines of implementation code depending on the target language. The team is deliberately prioritizing back-end code because it is more testable and easier to make deterministic.

But, if I know my 100 lines of spec always generate the same outcome up to a complexity of 20,000 lines of code, then do I care? How many lines of code was the original Super Mario?

**Low cost of entry**

I don't want to learn another language and I don't want to leave my current `claude` or other agent ecosystem that gets me paid. Hey, they work, we can write programs, we are succeeding. The issue is clearly *my* human brain, not `claude`, so, why should I limit *my* tooling when I'm the problem…

Thankfully, they agree, and spec definition itself is "mostly" free because it can, in the first instance, be written by `claude` (and other agent connector), using their utility `PlainForge`. So on first use, we get a `q & a` initialization that defines the spec for us. Because, in the words of Miller, we just need to be able "to make relative rather than absolute judgments."

**Some personal extensions**

I have a thing called [*aphantasia*](https://en.wikipedia.org/wiki/Aphantasia), so, I am constantly looking for aids that help me see concepts visually. One idea I've had is using the specification dimensions in the `plain` file as targets for a visualization transpiler (think drawio → plain → test → program). I would have never considered working on something like this if it was viz → code.

**Editor Note**

I am the author and the editor here, so: (1) corrections and feedback are always appreciated, and (2) I might look back at this in the future and change some stuff.
