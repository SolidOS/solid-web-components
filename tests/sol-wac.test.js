/**
 * Tests for WAC (Web Access Control) functions from sol-wac.js.
 * Pure logic — uses the rdflib mock for parseAcl; no DOM needed.
 */

import { jest } from '@jest/globals';
import {
  ROLES,
  GRANT_OPTIONS,
  parseAcl,
  authsToRoleModel,
  roleModelToTurtle,
  adaptInheritedAcl,
  getAclUrl,
  getPermissions,
} from '../sol-wac.js';

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
});
