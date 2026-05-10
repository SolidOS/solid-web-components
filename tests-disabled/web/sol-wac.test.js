/**
 * @jest-environment jsdom
 *
 * Tests for WAC (Web Access Control) — pure functions and SolWac component.
 */

import { jest } from '@jest/globals';
import rdflib from '../__mocks__/rdflib-esm.js';
window.$rdf = rdflib;
window.__SolSuppressDefineWarn = true;

import {
  ROLES,
  GRANT_OPTIONS,
  parseAcl,
  authsToRoleModel,
  roleModelToTurtle,
  adaptInheritedAcl,
  getAclUrl,
  getPermissions,
  SolWac,
} from '../../web/sol-wac.js';

const ACL = 'http://www.w3.org/ns/auth/acl#';
const FOAF = 'http://xmlns.com/foaf/0.1/';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

// ── Constants ─────────────────────────────────────────────────────────────

describe('ROLES', () => {
  test('has four roles', () => {
    expect(ROLES.map(r => r.key)).toEqual(['viewer', 'poster', 'editor', 'owner']);
  });

  test('owner has Control mode', () => {
    const owner = ROLES.find(r => r.key === 'owner');
    expect(owner.modes).toContain(ACL + 'Control');
  });
});

describe('GRANT_OPTIONS', () => {
  test('has four grant types', () => {
    expect(GRANT_OPTIONS.map(g => g.value))
      .toEqual(['nobody', 'specific', 'authenticated', 'public']);
  });
});

// ── parseAcl ──────────────────────────────────────────────────────────────

describe('parseAcl', () => {
  test('parses a simple owner authorization', () => {
    const turtle = `
      <http://ex/.acl#owner> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#owner> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#owner> <${ACL}mode> <${ACL}Write> .
      <http://ex/.acl#owner> <${ACL}mode> <${ACL}Control> .
      <http://ex/.acl#owner> <${ACL}agent> <http://alice.example.com/card#me> .
      <http://ex/.acl#owner> <${ACL}accessTo> <http://ex/> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths.length).toBe(1);
    expect(auths[0].modes).toContain(ACL + 'Control');
    expect(auths[0].agents).toContain('http://alice.example.com/card#me');
    expect(auths[0].accessTo).toContain('http://ex/');
  });

  test('parses multiple authorizations', () => {
    const turtle = `
      <http://ex/.acl#owner> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#owner> <${ACL}mode> <${ACL}Control> .
      <http://ex/.acl#owner> <${ACL}agent> <http://alice.example.com/card#me> .
      <http://ex/.acl#public> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#public> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#public> <${ACL}agentClass> <${FOAF}Agent> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths.length).toBe(2);
  });

  test('skips auths with no modes', () => {
    const turtle = `
      <http://ex/.acl#empty> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#empty> <${ACL}agent> <http://alice.example.com/card#me> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths.length).toBe(0);
  });

  test('returns empty array for malformed Turtle', () => {
    const auths = parseAcl('not valid turtle at all!!!', 'http://ex/.acl');
    expect(auths).toEqual([]);
  });

  test('parses acl:default for containers', () => {
    const turtle = `
      <http://ex/.acl#reader> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#reader> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#reader> <${ACL}agentClass> <${FOAF}Agent> .
      <http://ex/.acl#reader> <${ACL}default> <http://ex/> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths[0].default).toContain('http://ex/');
  });
});

// ── authsToRoleModel ──────────────────────────────────────────────────────

describe('authsToRoleModel', () => {
  test('empty auths → all roles set to nobody', () => {
    const model = authsToRoleModel([]);
    for (const role of ROLES) {
      expect(model[role.key].grant).toBe('nobody');
    }
  });

  test('public reader → viewer grant = public', () => {
    const auths = [{
      modes: [ACL + 'Read'],
      agents: [],
      agentClasses: [FOAF + 'Agent'],
      agentGroups: [],
      accessTo: ['http://ex/'],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.viewer.grant).toBe('public');
  });

  test('authenticated reader → viewer grant = authenticated', () => {
    const auths = [{
      modes: [ACL + 'Read'],
      agents: [],
      agentClasses: [ACL + 'AuthenticatedAgent'],
      agentGroups: [],
      accessTo: ['http://ex/'],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.viewer.grant).toBe('authenticated');
  });

  test('specific agent → grant = specific with webids', () => {
    const auths = [{
      modes: [ACL + 'Read'],
      agents: ['http://alice.example.com/card#me'],
      agentClasses: [],
      agentGroups: [],
      accessTo: ['http://ex/'],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.viewer.grant).toBe('specific');
    expect(model.viewer.webids).toContain('http://alice.example.com/card#me');
  });

  test('Control mode → owner role', () => {
    const auths = [{
      modes: [ACL + 'Read', ACL + 'Write', ACL + 'Control'],
      agents: ['http://alice.example.com/card#me'],
      agentClasses: [],
      agentGroups: [],
      accessTo: ['http://ex/'],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.owner.grant).toBe('specific');
    expect(model.owner.webids).toContain('http://alice.example.com/card#me');
  });

  test('Write mode without Control → editor role', () => {
    const auths = [{
      modes: [ACL + 'Read', ACL + 'Write'],
      agents: ['http://bob.example.com/card#me'],
      agentClasses: [],
      agentGroups: [],
      accessTo: [],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.editor.grant).toBe('specific');
  });

  test('Append mode → poster role', () => {
    const auths = [{
      modes: [ACL + 'Read', ACL + 'Append'],
      agents: [],
      agentClasses: [ACL + 'AuthenticatedAgent'],
      agentGroups: [],
      accessTo: [],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.poster.grant).toBe('authenticated');
  });

  test('default present → applyToContents = true', () => {
    const auths = [{
      modes: [ACL + 'Read'],
      agents: [],
      agentClasses: [FOAF + 'Agent'],
      agentGroups: [],
      accessTo: ['http://ex/'],
      default: ['http://ex/'],
    }];
    const model = authsToRoleModel(auths);
    expect(model.viewer.applyToContents).toBe(true);
  });

  test('agentGroup → groups populated', () => {
    const auths = [{
      modes: [ACL + 'Read'],
      agents: [],
      agentClasses: [],
      agentGroups: ['http://example.com/groups/friends'],
      accessTo: [],
      default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.viewer.grant).toBe('specific');
    expect(model.viewer.groups).toContain('http://example.com/groups/friends');
  });
});

// ── roleModelToTurtle ─────────────────────────────────────────────────────

describe('roleModelToTurtle', () => {
  test('skips nobody grants', () => {
    const model = authsToRoleModel([]);
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).not.toContain('acl:mode');
  });

  test('generates public viewer auth', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'public';
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:accessTo <http://ex/file.ttl>');
    expect(turtle).toContain('acl:mode acl:Read');
    expect(turtle).toContain('foaf:Agent');
  });

  test('generates authenticated editor', () => {
    const model = authsToRoleModel([]);
    model.editor.grant = 'authenticated';
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:AuthenticatedAgent');
    expect(turtle).toContain('acl:Read');
    expect(turtle).toContain('acl:Write');
  });

  test('generates specific agent with webids', () => {
    const model = authsToRoleModel([]);
    model.owner.grant = 'specific';
    model.owner.webids = ['http://alice.example.com/card#me'];
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:agent <http://alice.example.com/card#me>');
    expect(turtle).toContain('acl:Control');
  });

  test('includes acl:default for containers with applyToContents', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'public';
    model.viewer.applyToContents = true;
    const turtle = roleModelToTurtle(model, 'http://ex/container/');
    expect(turtle).toContain('acl:default <http://ex/container/>');
  });

  test('omits acl:default for non-container URLs', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'public';
    model.viewer.applyToContents = true;
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).not.toContain('acl:default');
  });
});

// ── adaptInheritedAcl ─────────────────────────────────────────────────────

describe('adaptInheritedAcl', () => {
  test('replaces parent URL with resource URL', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#auth1>
    a acl:Authorization;
    acl:accessTo <http://ex/parent/>;
    acl:default <http://ex/parent/>;
    acl:mode acl:Read;
    acl:agentClass <http://xmlns.com/foaf/0.1/Agent>.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/parent/', 'http://ex/parent/child.ttl');
    expect(result).toContain('<http://ex/parent/child.ttl>');
    expect(result).not.toContain('<http://ex/parent/>');
  });

  test('drops auth blocks without acl:default', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#owner>
    a acl:Authorization;
    acl:accessTo <http://ex/parent/>;
    acl:mode acl:Control;
    acl:agent <http://alice.example.com/card#me>.

<#public>
    a acl:Authorization;
    acl:accessTo <http://ex/parent/>;
    acl:default <http://ex/parent/>;
    acl:mode acl:Read;
    acl:agentClass <http://xmlns.com/foaf/0.1/Agent>.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/parent/', 'http://ex/parent/child/');
    expect(result).toContain('acl:Read');
    expect(result).not.toContain('acl:Control');
  });

  test('keeps prefix declarations', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@base <http://ex/>.

<#auth1>
    a acl:Authorization;
    acl:default <http://ex/parent/>;
    acl:mode acl:Read.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/parent/', 'http://ex/parent/child/');
    expect(result).toContain('@prefix');
    expect(result).toContain('@base');
  });

  test('keeps multiple default blocks', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#a1>
    a acl:Authorization;
    acl:default <http://ex/parent/>;
    acl:mode acl:Read;
    acl:agentClass <http://xmlns.com/foaf/0.1/Agent>.

<#a2>
    a acl:Authorization;
    acl:default <http://ex/parent/>;
    acl:mode acl:Write;
    acl:agent <http://alice.example.com/card#me>.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/parent/', 'http://ex/parent/child/');
    expect(result).toContain('acl:Read');
    expect(result).toContain('acl:Write');
  });

  test('handles parent URL with regex-special characters', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#a1>
    a acl:Authorization;
    acl:default <http://ex/path+special(1)/>;
    acl:mode acl:Read.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/path+special(1)/', 'http://ex/path+special(1)/child/');
    expect(result).toContain('<http://ex/path+special(1)/child/>');
    expect(result).not.toContain('<http://ex/path+special(1)/>');
  });
});

// ── authsToRoleModel edge cases ───────────────────────────────────────────

describe('authsToRoleModel — edge cases', () => {
  test('public overrides authenticated for same role', () => {
    const auths = [
      {
        modes: [ACL + 'Read'],
        agents: [], agentClasses: [ACL + 'AuthenticatedAgent'], agentGroups: [],
        accessTo: [], default: [],
      },
      {
        modes: [ACL + 'Read'],
        agents: [], agentClasses: [FOAF + 'Agent'], agentGroups: [],
        accessTo: [], default: [],
      },
    ];
    const model = authsToRoleModel(auths);
    expect(model.viewer.grant).toBe('public');
  });

  test('multiple agents accumulate in webids', () => {
    const auths = [
      {
        modes: [ACL + 'Read'],
        agents: ['http://alice.example.com/card#me'],
        agentClasses: [], agentGroups: [],
        accessTo: [], default: [],
      },
      {
        modes: [ACL + 'Read'],
        agents: ['http://bob.example.com/card#me'],
        agentClasses: [], agentGroups: [],
        accessTo: [], default: [],
      },
    ];
    const model = authsToRoleModel(auths);
    expect(model.viewer.webids).toContain('http://alice.example.com/card#me');
    expect(model.viewer.webids).toContain('http://bob.example.com/card#me');
  });

  test('duplicate agents are deduplicated', () => {
    const auths = [
      {
        modes: [ACL + 'Read'],
        agents: ['http://alice.example.com/card#me'],
        agentClasses: [], agentGroups: [],
        accessTo: [], default: [],
      },
      {
        modes: [ACL + 'Read'],
        agents: ['http://alice.example.com/card#me'],
        agentClasses: [], agentGroups: [],
        accessTo: [], default: [],
      },
    ];
    const model = authsToRoleModel(auths);
    expect(model.viewer.webids.length).toBe(1);
  });

  test('auth with unrecognised modes is skipped', () => {
    const auths = [{
      modes: ['http://example.org/custom#mode'],
      agents: ['http://alice.example.com/card#me'],
      agentClasses: [], agentGroups: [],
      accessTo: [], default: [],
    }];
    const model = authsToRoleModel(auths);
    for (const role of ROLES) {
      expect(model[role.key].grant).toBe('nobody');
    }
  });

  test('mixed agents and groups in same auth', () => {
    const auths = [{
      modes: [ACL + 'Read', ACL + 'Write'],
      agents: ['http://alice.example.com/card#me'],
      agentClasses: [],
      agentGroups: ['http://example.com/groups/editors'],
      accessTo: [], default: [],
    }];
    const model = authsToRoleModel(auths);
    expect(model.editor.grant).toBe('specific');
    expect(model.editor.webids).toContain('http://alice.example.com/card#me');
    expect(model.editor.groups).toContain('http://example.com/groups/editors');
  });
});

// ── roleModelToTurtle edge cases ──────────────────────────────────────────

describe('roleModelToTurtle — edge cases', () => {
  test('includes prefix declarations', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'public';
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('@prefix acl:');
    expect(turtle).toContain('@prefix foaf:');
  });

  test('generates multiple auth blocks for multiple roles', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'public';
    model.editor.grant = 'authenticated';
    model.owner.grant = 'specific';
    model.owner.webids = ['http://alice.example.com/card#me'];
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect((turtle.match(/<#auth\d+>/g) || []).length).toBe(3);
  });

  test('generates both agent and agentGroup for specific grant', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'specific';
    model.viewer.webids = ['http://alice.example.com/card#me'];
    model.viewer.groups = ['http://example.com/groups/friends'];
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:agent <http://alice.example.com/card#me>');
    expect(turtle).toContain('acl:agentGroup <http://example.com/groups/friends>');
  });

  test('editor mode list includes Read, Write, Append', () => {
    const model = authsToRoleModel([]);
    model.editor.grant = 'public';
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:Read');
    expect(turtle).toContain('acl:Write');
    expect(turtle).toContain('acl:Append');
  });
});

// ── parseAcl edge cases ──────────────────────────────────────────────────

describe('parseAcl — edge cases', () => {
  test('empty string returns empty array', () => {
    expect(parseAcl('', 'http://ex/.acl')).toEqual([]);
  });

  test('parses agentGroup', () => {
    const turtle = `
      <http://ex/.acl#team> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#team> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#team> <${ACL}agentGroup> <http://example.com/groups/team> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths[0].agentGroups).toContain('http://example.com/groups/team');
  });

  test('auth with multiple modes collects all', () => {
    const turtle = `
      <http://ex/.acl#full> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#full> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#full> <${ACL}mode> <${ACL}Write> .
      <http://ex/.acl#full> <${ACL}mode> <${ACL}Append> .
      <http://ex/.acl#full> <${ACL}mode> <${ACL}Control> .
      <http://ex/.acl#full> <${ACL}agent> <http://alice.example.com/card#me> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths[0].modes).toHaveLength(4);
    expect(auths[0].modes).toContain(ACL + 'Read');
    expect(auths[0].modes).toContain(ACL + 'Write');
    expect(auths[0].modes).toContain(ACL + 'Append');
    expect(auths[0].modes).toContain(ACL + 'Control');
  });

  test('auth with multiple agents collects all', () => {
    const turtle = `
      <http://ex/.acl#shared> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#shared> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#shared> <${ACL}agent> <http://alice.example.com/card#me> .
      <http://ex/.acl#shared> <${ACL}agent> <http://bob.example.com/card#me> .
    `;
    const auths = parseAcl(turtle, 'http://ex/.acl');
    expect(auths[0].agents).toHaveLength(2);
  });
});

// ── getAclUrl ─────────────────────────────────────────────────────────────

describe('getAclUrl', () => {
  test('extracts ACL URL from Link header', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true,
      headers: { get: (h) => h === 'Link' ? '<http://ex/file.acl>; rel="acl"' : null },
    }));
    const url = await getAclUrl('http://ex/file.ttl', fetchFn);
    expect(url).toBe('http://ex/file.acl');
  });

  test('falls back to .acl suffix when no Link header', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true,
      headers: { get: () => null },
    }));
    const url = await getAclUrl('http://ex/file.ttl', fetchFn);
    expect(url).toBe('http://ex/file.ttl.acl');
  });

  test('falls back to .acl suffix on fetch error', async () => {
    const fetchFn = jest.fn(async () => { throw new Error('network'); });
    const url = await getAclUrl('http://ex/file.ttl', fetchFn);
    expect(url).toBe('http://ex/file.ttl.acl');
  });

  test('resolves relative ACL URL against resource URL', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true,
      headers: { get: (h) => h === 'Link' ? '<.acl>; rel="acl"' : null },
    }));
    const url = await getAclUrl('http://ex/path/file.ttl', fetchFn);
    expect(url).toBe('http://ex/path/.acl');
  });

  test('uses HEAD method', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: true,
      headers: { get: () => null },
    }));
    await getAclUrl('http://ex/file.ttl', fetchFn);
    expect(fetchFn.mock.calls[0][1].method).toBe('HEAD');
  });
});

// ── getPermissions ────────────────────────────────────────────────────────

describe('getPermissions', () => {
  test('returns own ACL when resource has its own .acl', async () => {
    const fetchFn = jest.fn(async (url) => {
      if (url === 'http://ex/file.ttl') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? '<http://ex/file.ttl.acl>; rel="acl"' : null } };
      }
      if (url === 'http://ex/file.ttl.acl') {
        return { ok: true, text: async () => 'own-acl-turtle', headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    const perms = await getPermissions('http://ex/file.ttl', fetchFn);
    expect(perms.own).toBe('own-acl-turtle');
    expect(perms.aclUrl).toBe('http://ex/file.ttl.acl');
    expect(perms.inherited).toBeNull();
  });

  test('walks up to find inherited ACL', async () => {
    const fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      if (url === 'http://ex/a/b/file.ttl.acl') {
        return { ok: false, headers: { get: () => null } };
      }
      if (url === 'http://ex/a/b/.acl') {
        return { ok: false, headers: { get: () => null } };
      }
      if (url === 'http://ex/a/.acl') {
        return { ok: true, text: async () => 'inherited-turtle', headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    const perms = await getPermissions('http://ex/a/b/file.ttl', fetchFn);
    expect(perms.own).toBeNull();
    expect(perms.inherited).toBe('inherited-turtle');
    expect(perms.inheritedFrom).toBe('http://ex/a/');
  });

  test('returns all nulls when no ACL found anywhere', async () => {
    const fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    const perms = await getPermissions('http://ex/a/file.ttl', fetchFn);
    expect(perms.own).toBeNull();
    expect(perms.inherited).toBeNull();
    expect(perms.inheritedFrom).toBeNull();
  });

  test('walks to root for deeply nested URL', async () => {
    const fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      if (url === 'http://ex/.acl') {
        return { ok: true, text: async () => 'root-acl', headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    const perms = await getPermissions('http://ex/a/b/c/file.ttl', fetchFn);
    expect(perms.own).toBeNull();
    expect(perms.inherited).toBe('root-acl');
    expect(perms.inheritedFrom).toBe('http://ex/');
  });

  test('handles container URL (trailing slash)', async () => {
    const fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      if (url === 'http://ex/folder/.acl') {
        return { ok: true, text: async () => 'folder-acl', headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    const perms = await getPermissions('http://ex/folder/', fetchFn);
    expect(perms.own).toBe('folder-acl');
  });
});

// ── Round-trip fidelity ─────────────────────────────────────────────────────

describe('round-trip: parse → model → turtle → parse → model', () => {
  test('public reader survives round-trip', () => {
    const turtle1 = `
      <http://ex/.acl#pub> <${RDF_TYPE}> <${ACL}Authorization> .
      <http://ex/.acl#pub> <${ACL}mode> <${ACL}Read> .
      <http://ex/.acl#pub> <${ACL}agentClass> <${FOAF}Agent> .
      <http://ex/.acl#pub> <${ACL}accessTo> <http://ex/file.ttl> .
    `;
    const model1 = authsToRoleModel(parseAcl(turtle1, 'http://ex/.acl'));
    const turtle2 = roleModelToTurtle(model1, 'http://ex/file.ttl');
    const model2 = authsToRoleModel(parseAcl(turtle2, 'http://ex/file.ttl'));

    expect(model2.viewer.grant).toBe('public');
    expect(model2.poster.grant).toBe('nobody');
    expect(model2.editor.grant).toBe('nobody');
    expect(model2.owner.grant).toBe('nobody');
  });

  test('specific agent + group survives round-trip', () => {
    const model1 = authsToRoleModel([]);
    model1.editor.grant = 'specific';
    model1.editor.webids = ['http://alice.example.com/card#me'];
    model1.editor.groups = ['http://example.com/groups/editors'];

    const turtle = roleModelToTurtle(model1, 'http://ex/file.ttl');
    const model2 = authsToRoleModel(parseAcl(turtle, 'http://ex/file.ttl'));

    expect(model2.editor.grant).toBe('specific');
    expect(model2.editor.webids).toContain('http://alice.example.com/card#me');
    expect(model2.editor.groups).toContain('http://example.com/groups/editors');
  });

  test('multi-role ACL survives round-trip', () => {
    const model1 = authsToRoleModel([]);
    model1.viewer.grant = 'public';
    model1.editor.grant = 'authenticated';
    model1.owner.grant = 'specific';
    model1.owner.webids = ['http://alice.example.com/card#me'];

    const turtle = roleModelToTurtle(model1, 'http://ex/file.ttl');
    const model2 = authsToRoleModel(parseAcl(turtle, 'http://ex/file.ttl'));

    expect(model2.viewer.grant).toBe('public');
    expect(model2.editor.grant).toBe('authenticated');
    expect(model2.owner.grant).toBe('specific');
    expect(model2.owner.webids).toContain('http://alice.example.com/card#me');
    expect(model2.poster.grant).toBe('nobody');
  });

  test('container with applyToContents survives round-trip', () => {
    const model1 = authsToRoleModel([]);
    model1.viewer.grant = 'public';
    model1.viewer.applyToContents = true;

    const turtle = roleModelToTurtle(model1, 'http://ex/container/');
    const model2 = authsToRoleModel(parseAcl(turtle, 'http://ex/container/'));

    expect(model2.viewer.grant).toBe('public');
    expect(model2.viewer.applyToContents).toBe(true);
  });
});

// ── roleModelToTurtle — additional edge cases ────────────────────────────────

describe('roleModelToTurtle — specific grant edge cases', () => {
  test('specific grant with only groups (no webids)', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'specific';
    model.viewer.groups = ['http://example.com/groups/friends'];
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:agentGroup <http://example.com/groups/friends>');
    expect(turtle).not.toContain('acl:agent <');
  });

  test('specific grant with multiple webids', () => {
    const model = authsToRoleModel([]);
    model.viewer.grant = 'specific';
    model.viewer.webids = ['http://alice.example.com/card#me', 'http://bob.example.com/card#me'];
    const turtle = roleModelToTurtle(model, 'http://ex/file.ttl');
    expect(turtle).toContain('acl:agent <http://alice.example.com/card#me>');
    expect(turtle).toContain('acl:agent <http://bob.example.com/card#me>');
  });
});

// ── adaptInheritedAcl — additional edge cases ────────────────────────────────

describe('adaptInheritedAcl — edge cases', () => {
  test('empty string returns empty', () => {
    const result = adaptInheritedAcl('', 'http://ex/parent/', 'http://ex/parent/child/');
    expect(result.trim()).toBe('');
  });

  test('only non-default blocks → returns only prefix declarations', () => {
    const inherited = `@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#owner>
    a acl:Authorization;
    acl:accessTo <http://ex/parent/>;
    acl:mode acl:Control;
    acl:agent <http://alice.example.com/card#me>.`;

    const result = adaptInheritedAcl(inherited, 'http://ex/parent/', 'http://ex/parent/child/');
    expect(result).toContain('@prefix');
    expect(result).not.toContain('acl:Control');
  });
});

// ── SolWac component ────────────────────────────────────────────────────────

function mockFetchSuccess(aclTurtle) {
  return jest.fn(async (url, opts) => {
    if (opts?.method === 'HEAD') {
      return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
    }
    if (url.endsWith('.acl')) {
      return { ok: true, text: async () => aclTurtle, headers: { get: () => null } };
    }
    return { ok: false, headers: { get: () => null } };
  });
}

describe('SolWac component', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('is a registered custom element', () => {
    expect(customElements.get('sol-wac')).toBe(SolWac);
  });

  test('observedAttributes includes source', () => {
    expect(SolWac.observedAttributes).toContain('source');
  });

  test('source getter/setter reflects attribute', () => {
    const el = document.createElement('sol-wac');
    el.source = 'http://ex/file.ttl';
    expect(el.getAttribute('source')).toBe('http://ex/file.ttl');
    expect(el.source).toBe('http://ex/file.ttl');
  });

  test('source setter with empty string removes attribute', () => {
    const el = document.createElement('sol-wac');
    el.source = 'http://ex/file.ttl';
    el.source = '';
    expect(el.hasAttribute('source')).toBe(false);
    expect(el.source).toBe('');
  });

  test('fetchFn returns null when no fetch available and none set', () => {
    const el = document.createElement('sol-wac');
    expect(el.fetchFn).toBeNull();
  });

  test('fetchFn returns custom function when set', () => {
    const el = document.createElement('sol-wac');
    const fn = jest.fn();
    el.fetchFn = fn;
    expect(el.fetchFn).toBe(fn);
  });

  test('load() does nothing when source is empty', async () => {
    const el = document.createElement('sol-wac');
    const fn = jest.fn();
    el.fetchFn = fn;
    document.body.appendChild(el);
    await el.load();
    expect(fn).not.toHaveBeenCalled();
  });

  test('load() shows loading banner then renders', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/file.ttl>;
        acl:mode acl:Read;
        acl:agentClass foaf:Agent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    const tabs = el.querySelector('sol-tabs');
    expect(tabs).not.toBeNull();
    expect(tabs.getAttribute('variant')).toBe('sub');
  });

  test('load() emits sol-wac-error on fetch failure', async () => {
    const el = document.createElement('sol-wac');
    el.fetchFn = jest.fn(async () => { throw new Error('network down'); });
    el.setAttribute('source', 'http://ex/file.ttl');

    const errors = [];
    el.addEventListener('sol-wac-error', (e) => errors.push(e.detail));
    await el.load();

    expect(errors).toHaveLength(1);
    expect(errors[0].phase).toBe('load');
    expect(errors[0].error.message).toBe('network down');
  });

  test('load() renders error message on failure', async () => {
    const el = document.createElement('sol-wac');
    el.fetchFn = jest.fn(async () => { throw new Error('403 Forbidden'); });
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    expect(el.innerHTML).toContain('Failed to load ACL');
    expect(el.innerHTML).toContain('403 Forbidden');
  });

  test('load() with inherited ACL shows inheritance banner', async () => {
    const inheritedTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/parent/>;
        acl:default <http://ex/parent/>;
        acl:mode acl:Read;
        acl:agentClass foaf:Agent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      if (url === 'http://ex/parent/child.ttl.acl') {
        return { ok: false, headers: { get: () => null } };
      }
      if (url === 'http://ex/parent/.acl') {
        return { ok: true, text: async () => inheritedTurtle, headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/parent/child.ttl');
    await el.load();

    const banner = el.querySelector('.acl-banner');
    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain('Inheriting');
    expect(banner.textContent).toContain('http://ex/parent/');
  });

  test('load() with own ACL hides inheritance banner', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/file.ttl>;
        acl:mode acl:Read;
        acl:agentClass acl:AuthenticatedAgent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    expect(el._bannerEl).toBeDefined();
    expect(el._bannerEl.style.display).toBe('none');
  });

  test('save() PUTs turtle and emits sol-wac-save + sol-status', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/file.ttl>;
        acl:mode acl:Read;
        acl:agentClass foaf:Agent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    const saveEvents = [];
    const statusEvents = [];
    el.addEventListener('sol-wac-save', (e) => saveEvents.push(e.detail));
    el.addEventListener('sol-status', (e) => statusEvents.push(e.detail));

    el.fetchFn.mockImplementation(async (url, opts) => {
      if (opts?.method === 'PUT') {
        return { ok: true, status: 200, statusText: 'OK' };
      }
      return { ok: false };
    });

    await el.save();

    expect(saveEvents).toHaveLength(1);
    expect(saveEvents[0].aclUrl).toContain('.acl');
    expect(statusEvents).toHaveLength(1);
    expect(statusEvents[0].message).toBe('ACL saved.');
    expect(statusEvents[0].type).toBe('success');
  });

  test('save() emits sol-wac-error + sol-status on failure', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/file.ttl>;
        acl:mode acl:Read;
        acl:agentClass acl:AuthenticatedAgent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    const errors = [];
    const statuses = [];
    el.addEventListener('sol-wac-error', (e) => errors.push(e.detail));
    el.addEventListener('sol-status', (e) => statuses.push(e.detail));

    el.fetchFn.mockImplementation(async () => ({ ok: false, status: 403, statusText: 'Forbidden' }));
    await el.save();

    expect(errors).toHaveLength(1);
    expect(errors[0].phase).toBe('save');
    expect(statuses).toHaveLength(1);
    expect(statuses[0].type).toBe('error');
    expect(statuses[0].message).toContain('403 Forbidden');
  });

  test('save() is no-op when aclUrl is not set', async () => {
    const el = document.createElement('sol-wac');
    const fn = jest.fn();
    el.fetchFn = fn;
    document.body.appendChild(el);
    await el.save();
    expect(fn).not.toHaveBeenCalled();
  });

  test('save() sends PUT with text/turtle content type', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/file.ttl>;
        acl:mode acl:Read;
        acl:agentClass acl:AuthenticatedAgent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');
    await el.load();

    const putCalls = [];
    el.fetchFn.mockImplementation(async (url, opts) => {
      if (opts?.method === 'PUT') putCalls.push({ url, opts });
      return { ok: true, status: 200, statusText: 'OK' };
    });
    await el.save();

    expect(putCalls).toHaveLength(1);
    expect(putCalls[0].opts.method).toBe('PUT');
    expect(putCalls[0].opts.headers['Content-Type']).toBe('text/turtle');
    expect(typeof putCalls[0].opts.body).toBe('string');
  });

  test('events are bubbling and composed', async () => {
    const el = document.createElement('sol-wac');
    el.fetchFn = jest.fn(async () => { throw new Error('fail'); });
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/file.ttl');

    let event = null;
    document.body.addEventListener('sol-wac-error', (e) => { event = e; });
    await el.load();

    expect(event).not.toBeNull();
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  test('save() clears inherited state after successful save', async () => {
    const inheritedTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      @prefix foaf: <http://xmlns.com/foaf/0.1/>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/parent/>;
        acl:default <http://ex/parent/>;
        acl:mode acl:Read;
        acl:agentClass foaf:Agent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = jest.fn(async (url, opts) => {
      if (opts?.method === 'HEAD') {
        return { ok: true, headers: { get: (h) => h === 'Link' ? `<${url}.acl>; rel="acl"` : null } };
      }
      if (url === 'http://ex/parent/child.ttl.acl') {
        return { ok: false, headers: { get: () => null } };
      }
      if (url === 'http://ex/parent/.acl') {
        return { ok: true, text: async () => inheritedTurtle, headers: { get: () => null } };
      }
      return { ok: false, headers: { get: () => null } };
    });
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/parent/child.ttl');
    await el.load();

    expect(el._inherited).not.toBeNull();

    el.fetchFn.mockImplementation(async () => ({ ok: true, status: 200, statusText: 'OK' }));
    await el.save();

    expect(el._inherited).toBeNull();
    expect(el._inheritedFrom).toBeNull();
  });

  test('sets _isContainer for container URLs', async () => {
    const aclTurtle = `
      @prefix acl: <http://www.w3.org/ns/auth/acl#>.
      <#auth1> a acl:Authorization;
        acl:accessTo <http://ex/container/>;
        acl:mode acl:Read;
        acl:agentClass acl:AuthenticatedAgent.
    `;
    const el = document.createElement('sol-wac');
    el.fetchFn = mockFetchSuccess(aclTurtle);
    document.body.appendChild(el);
    el.setAttribute('source', 'http://ex/container/');
    await el.load();

    expect(el._isContainer).toBe(true);
  });
});
