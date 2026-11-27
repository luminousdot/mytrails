"use client";

import {
  Button,
  Column,
  DateInput,
  Feedback,
  Form,
  Heading,
  IconButton,
  Input,
  Media,
  Row,
  SegmentedControl,
  Select,
  Text,
  Textarea,
  Tooltip,
} from "@once-ui-system/core";
import { Map as PinMap, MapMarkers, MapPin } from "@once-ui-system/core/map";
import { MediaUpload } from "@once-ui-system/core/media";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { fill, intlLocale, localePath, type Dictionary } from "../../i18n";
import { useI18n } from "../../i18n/I18nProvider";
import { countryName } from "../../lib/race-utils";
import { submitRace } from "../../server/organizer-actions";
import { Hint } from "../Hint";
import {
  emptyDistance,
  validate,
  type DraftDistance,
  type DraftErrors,
  type OrganizerContact,
  type RaceDraft,
} from "../../lib/organizer-types";

const COUNTRIES = [
  "Serbia",
  "Bosnia and Herzegovina",
  "Montenegro",
  "Croatia",
  "Slovenia",
  "North Macedonia",
  "Kosovo",
  "Albania",
  "Bulgaria",
  "Romania",
  "Greece",
  "Hungary",
  "Austria",
  "Italy",
  "Turkey",
];
const MAX_PHOTOS = 6;

type Props =
  | { mode: "new"; initial: RaceDraft }
  | {
      mode: "claim";
      initial: RaceDraft;
      claim: { slug: string; name: string };
    };

const num = (v: string): number | null =>
  v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v);
const str = (v: number | null) => (v == null ? "" : String(v));

/** One form for adding a race and for claiming a listed one (pre-filled). */
export function RaceForm(props: Props) {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [race, setRace] = useState<RaceDraft>(props.initial);
  const [organizer, setOrganizer] = useState<OrganizerContact>({
    name: "",
    email: "",
    role: "director",
  });
  const [claimNote, setClaimNote] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [gpx, setGpx] = useState<Record<number, File>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<DraftErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const showMessage = (m: string) => {
    setMessage(m);
    // The summary sits at the top of a long form; bring it into view.
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Errors show after the first submit, then update as the organiser fixes them.
  const live = useMemo(
    () => validate(race, organizer, props.mode, claimNote),
    [race, organizer, props.mode, claimNote],
  );
  const errors: DraftErrors = attempted ? { ...serverErrors, ...live } : {};
  const err = (key: string) => (errors[key] ? t.errors[errors[key]!] : undefined);

  const set = (patch: Partial<RaceDraft>) =>
    setRace((r) => ({ ...r, ...patch }));
  const setDistance = (i: number, patch: Partial<DraftDistance>) =>
    setRace((r) => ({
      ...r,
      distances: r.distances.map((d, j) => (j === i ? { ...d, ...patch } : d)),
    }));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    setMessage(null);
    if (Object.keys(live).length) {
      showMessage(t.form.fixFields);
      return;
    }
    setPending(true);
    const form = new FormData();
    form.set(
      "payload",
      JSON.stringify({
        kind: props.mode,
        claimSlug: props.mode === "claim" ? props.claim.slug : undefined,
        race,
        organizer,
        claimNote,
      }),
    );
    photos.forEach((p, i) => form.set(`photo-${i}`, p.file));
    Object.entries(gpx).forEach(([i, f]) => form.set(`gpx-${i}`, f));
    try {
      const result = await submitRace(form);
      if (result.ok) {
        router.push(localePath(lang, `/organizers/thanks?id=${result.id}`));
        return;
      }
      setServerErrors(result.errors);
      setMessage(
        result.message ? t.errors[result.message] : t.form.fixFields,
      );
    } catch {
      setMessage(
        t.form.offline,
      );
    }
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Column gap="32">
        <div ref={topRef} style={{ scrollMarginTop: "6rem" }} />
      {message && <Feedback tone="danger" title={message} />}

        <Section
          title={t.form.raceTitle}
          description={t.form.raceText}
        >
          <Form columns={{ xl: 2, s: 1 }}>
            <Input
              id="race-name"
              label={t.form.name}
              value={race.name}
              onValueChange={(v) => set({ name: v })}
              errorMessage={err("name")}
              error={!!err("name")}
              span={2}
            />
            <DateField
              id="race-date-start"
              label={t.form.dateStart}
              value={race.date_start}
              onChange={(v) => set({ date_start: v })}
              error={err("date_start")}
            />
            <DateField
              id="race-date-end"
              label={t.form.dateEnd}
              value={race.date_end}
              onChange={(v) => set({ date_end: v })}
              error={err("date_end")}
              clearable
            />
            <Select
              id="race-country"
              label={t.form.country}
              searchable
              value={race.country}
              onValueChange={(v) => set({ country: v as string })}
              options={COUNTRIES.map((c) => ({ value: c, label: countryName(c, lang) }))}
            />
            <Input
              id="race-city"
              label={t.form.city}
              value={race.city}
              onValueChange={(v) => set({ city: v })}
              errorMessage={err("city")}
              error={!!err("city")}
            />
            <Input
              id="race-website"
              label={t.form.website}
              value={race.website}
              onValueChange={(v) => set({ website: v })}
              errorMessage={err("website")}
              error={!!err("website")}
            />
            <Input
              id="race-registration"
              label={t.form.registration}
              value={race.registration_url}
              onValueChange={(v) => set({ registration_url: v })}
              errorMessage={err("registration_url")}
              error={!!err("registration_url")}
            />
            <Textarea
              id="race-description"
              label={t.form.description}
              lines={4}
              value={race.description}
              onValueChange={(v) => set({ description: v })}
              span={2}
            />
          </Form>
          <StartPicker
            position={race.position}
            onChange={(position) => set({ position })}
          />
        </Section>

        <Section
          title={t.form.distancesTitle}
          description={t.form.distancesText}
        >
          {err("distances") && (
            <Feedback tone="danger" title={err("distances")} />
          )}
          <Column gap="16">
            {race.distances.map((d, i) => (
              <DistanceFields
                key={i}
                index={i}
                distance={d}
                gpx={gpx[i]}
                errors={errors}
                onChange={(patch) => setDistance(i, patch)}
                onGpx={(file) =>
                  setGpx((g) => {
                    const next = { ...g };
                    if (file) next[i] = file;
                    else delete next[i];
                    return next;
                  })
                }
                onRemove={
                  race.distances.length > 1
                    ? () => {
                        set({
                          distances: race.distances.filter((_, j) => j !== i),
                        });
                        // GPX files are keyed by position; shift the ones after the removed distance.
                        setGpx((g) => {
                          const next: Record<number, File> = {};
                          for (const [k, f] of Object.entries(g)) {
                            const n = Number(k);
                            if (n < i) next[n] = f;
                            if (n > i) next[n - 1] = f;
                          }
                          return next;
                        });
                      }
                    : undefined
                }
              />
            ))}
          </Column>
          <Row>
            <Button
              type="button"
              variant="secondary"
              prefixIcon="plus"
              onClick={() =>
                set({ distances: [...race.distances, emptyDistance()] })
              }
            >
              {t.form.addDistance}
            </Button>
          </Row>
        </Section>

        <Section
          title={t.form.photosTitle}
          description={fill(t.form.photosText, { n: MAX_PHOTOS })}
        >
          {err("photos") && <Feedback tone="danger" title={err("photos")} />}
          <Row gap="12" wrap>
            {photos.map((p, i) => (
              <Column key={p.url} width="12rem" gap="8">
                <Column radius="m" overflow="hidden" border>
                  <Media
                    src={p.url}
                    alt={fill(t.form.photoN, { n: i + 1 })}
                    aspectRatio="16 / 9"
                    unoptimized
                  />
                </Column>
                <Row horizontal="between" vertical="center">
                  <Text
                    textVariant="label-default-s"
                    onBackground="neutral-weak"
                  >
                    {i === 0 ? t.form.cover : fill(t.form.photoN, { n: i + 1 })}
                  </Text>
                  <IconButton
                    type="button"
                    icon="trash"
                    variant="tertiary"
                    size="s"
                    tooltip={fill(t.form.removePhoto, { n: i + 1 })}
                    aria-label={fill(t.form.removePhoto, { n: i + 1 })}
                    onClick={() =>
                      setPhotos((ps) => ps.filter((_, j) => j !== i))
                    }
                  />
                </Row>
              </Column>
            ))}
            {photos.length < MAX_PHOTOS && (
              <Column width="12rem">
                <MediaUpload
                  key={photos.length}
                  aspectRatio="16 / 9"
                  emptyState={
                    photos.length === 0 ? t.form.addCover : t.form.addPhoto
                  }
                  onFileUpload={async (file) => {
                    setPhotos((ps) => [
                      ...ps,
                      { file, url: URL.createObjectURL(file) },
                    ]);
                  }}
                />
              </Column>
            )}
          </Row>
        </Section>

        {props.mode === "claim" && (
          <Section
            title={t.form.proofTitle}
            description={fill(t.form.proofText, { name: props.claim.name })}
          >
            <Textarea
              id="claim-note"
              label={t.form.proofLabel}
              description={t.form.proofHelp}
              lines={3}
              value={claimNote}
              onValueChange={setClaimNote}
              errorMessage={err("claim_note")}
              error={!!err("claim_note")}
            />
          </Section>
        )}

        <Section
          title={t.form.youTitle}
          description={t.form.youText}
        >
          <Form columns={{ xl: 2, s: 1 }}>
            <Input
              id="organizer-name"
              label={t.form.yourName}
              value={organizer.name}
              onValueChange={(v) => setOrganizer((o) => ({ ...o, name: v }))}
              errorMessage={err("organizer.name")}
              error={!!err("organizer.name")}
            />
            <Input
              id="organizer-email"
              type="email"
              label={t.form.email}
              value={organizer.email}
              onValueChange={(v) => setOrganizer((o) => ({ ...o, email: v }))}
              errorMessage={err("organizer.email")}
              error={!!err("organizer.email")}
            />
          </Form>
          <Column gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {t.form.role}
            </Text>
            <SegmentedControl
              fillWidth={false}
              semantics="radio"
              aria-label={t.form.role}
              value={organizer.role}
              onValueChange={(v) =>
                setOrganizer((o) => ({
                  ...o,
                  role: v as OrganizerContact["role"],
                }))
              }
              buttons={[
                { value: "director", label: t.form.roleDirector },
                { value: "team", label: t.form.roleTeam },
                { value: "other", label: t.form.roleOther },
              ]}
            />
          </Column>
        </Section>

        <Row
          gap="12"
          vertical="center"
          horizontal="between"
          wrap
          s={{ direction: "column-reverse", horizontal: "start" }}
        >
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {t.form.reviewNote}
          </Text>
          <Button type="submit" size="l" loading={pending} disabled={pending}>
            {props.mode === "claim"
              ? t.form.sendClaim : t.form.sendRace}
          </Button>
        </Row>
      </Column>
    </form>
  );
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Once UI's date picker on a YYYY-MM-DD string, with the error line under it. */
function DateField({
  id,
  label,
  value,
  onChange,
  error,
  clearable,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  clearable?: boolean;
}) {
  const { lang, t } = useI18n();
  return (
    <Column gap="4">
      <Row gap="8" vertical="center">
        <Row flex={1} minWidth="0">
          <DateInput
            key={value ? "set" : "empty"}
            fillWidth
            id={id}
            label={label}
            locale={intlLocale[lang]}
            value={value ? fromIso(value) : undefined}
            onValueChange={(d: Date) => onChange(isoDay(d))}
          />
        </Row>
        {clearable && value && (
          <IconButton type="button" icon="close" variant="tertiary" tooltip={t.form.clearDate} aria-label={t.form.clearDate} onClick={() => onChange("")} />
        )}
      </Row>
      {error && (
        <Text textVariant="body-default-s" onBackground="danger-medium" role="alert">
          {error}
        </Text>
      )}
    </Column>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Column
      as="section"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="20"
      s={{ padding: "16" }}
    >
      <Column gap="4">
        <Heading as="h2" textVariant="heading-strong-l">
          {title}
        </Heading>
        <Text
          textVariant="body-default-s"
          onBackground="neutral-weak"
          wrap="pretty"
        >
          {description}
        </Text>
      </Column>
      {children}
    </Column>
  );
}

function DistanceFields({
  index,
  distance: d,
  gpx,
  errors,
  onChange,
  onGpx,
  onRemove,
}: {
  index: number;
  distance: DraftDistance;
  gpx?: File;
  errors: DraftErrors;
  onChange: (patch: Partial<DraftDistance>) => void;
  onGpx: (file: File | null) => void;
  onRemove?: () => void;
}) {
  const { t } = useI18n();
  const msg = (code?: keyof Dictionary["errors"]) => (code ? t.errors[code] : undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const k = (f: string) => `distances.${index}.${f}`;
  const setAid = (
    j: number,
    patch: Partial<DraftDistance["aid_stations"][number]>,
  ) =>
    onChange({
      aid_stations: d.aid_stations.map((a, x) =>
        x === j ? { ...a, ...patch } : a,
      ),
    });

  return (
    <Column border radius="m" padding="16" gap="16">
      <Row horizontal="between" vertical="center">
        <Text textVariant="label-strong-m">{fill(t.form.distanceN, { n: index + 1 })}</Text>
        {onRemove && (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            prefixIcon="trash"
            onClick={onRemove}
          >
            {t.common.remove}
          </Button>
        )}
      </Row>
      <Form columns={{ xl: 3, s: 1 }}>
        <Input
          id={`d${index}-name`}
          label={t.form.distanceName}
          value={d.name}
          onValueChange={(v) => onChange({ name: v })}
          span={3}
        />
        <Input
          id={`d${index}-km`}
          type="number"
          label={t.form.km}
          value={str(d.distance_km)}
          onValueChange={(v) => onChange({ distance_km: num(v) })}
          errorMessage={msg(errors[k("distance_km")])}
          error={!!errors[k("distance_km")]}
        />
        <Input
          id={`d${index}-gain`}
          type="number"
          label={t.form.gain}
          value={str(d.elevation_gain_m)}
          onValueChange={(v) => onChange({ elevation_gain_m: num(v) })}
          errorMessage={msg(errors[k("elevation_gain_m")])}
          error={!!errors[k("elevation_gain_m")]}
        />
        <Input
          id={`d${index}-cutoff`}
          type="number"
          label={t.form.cutoff}
          value={str(d.time_limit_hours)}
          onValueChange={(v) => onChange({ time_limit_hours: num(v) })}
        />
        <Input
          id={`d${index}-start`}
          label={t.form.startTime}
          value={d.start_time}
          onValueChange={(v) => onChange({ start_time: v })}
          errorMessage={msg(errors[k("start_time")])}
          error={!!errors[k("start_time")]}
        />
      </Form>

      <Row gap="12" vertical="center" wrap>
        {/* Hidden native picker; the Button is what people see and press. */}
        <input
          ref={fileRef}
          type="file"
          accept=".gpx,application/gpx+xml"
          hidden
          onChange={(e) => {
            onGpx(e.target.files?.[0] ?? null);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="s"
          prefixIcon="upload"
          onClick={() => fileRef.current?.click()}
        >
          {gpx ? t.form.replaceGpx : t.form.uploadGpx}
        </Button>
        <Tooltip content={t.hints.gpx} size="xs" />
        <Text
          textVariant="body-default-s"
          onBackground={errors[k("gpx")] ? "danger-medium" : "neutral-weak"}
        >
          {errors[k("gpx")] ? t.errors[errors[k("gpx")]!] : gpx ? gpx.name : t.form.noGpx}
        </Text>
        {gpx && (
          <IconButton
            type="button"
            icon="close"
            variant="tertiary"
            size="s"
            tooltip={t.form.removeGpx}
            aria-label={t.form.removeGpx}
            onClick={() => onGpx(null)}
          />
        )}
      </Row>

      <Column gap="8">
        <Hint text={t.hints.aid}>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            {t.form.aidStations}
          </Text>
        </Hint>
        {d.aid_stations.map((a, j) => (
          <Row key={j} gap="8" vertical="start">
            <Row flex={3} minWidth="0">
              <Input
                id={`d${index}-aid${j}-name`}
                size="s"
                label={t.form.aidName}
                value={a.name}
                onValueChange={(v) => setAid(j, { name: v })}
                errorMessage={msg(errors[k(`aid.${j}.name`)])}
                error={!!errors[k(`aid.${j}.name`)]}
              />
            </Row>
            <Row flex={1} minWidth="6rem">
              <Input
                id={`d${index}-aid${j}-km`}
                size="s"
                type="number"
                label={t.form.aidKm}
                value={str(a.km)}
                onValueChange={(v) => setAid(j, { km: num(v) })}
                errorMessage={msg(errors[k(`aid.${j}.km`)])}
                error={!!errors[k(`aid.${j}.km`)]}
              />
            </Row>
            <IconButton
              type="button"
              icon="trash"
              variant="tertiary"
              tooltip={fill(t.form.removeAid, { n: j + 1 })}
              aria-label={fill(t.form.removeAid, { n: j + 1 })}
              onClick={() =>
                onChange({
                  aid_stations: d.aid_stations.filter((_, x) => x !== j),
                })
              }
            />
          </Row>
        ))}
        <Row>
          <Button
            type="button"
            variant="tertiary"
            size="s"
            prefixIcon="plus"
            onClick={() =>
              onChange({
                aid_stations: [...d.aid_stations, { name: "", km: null }],
              })
            }
          >
            {t.form.addAid}
          </Button>
        </Row>
      </Column>
    </Column>
  );
}

/** Optional pin for the start; without it we use the GPX start, then the town. */
function StartPicker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (p: [number, number] | null) => void;
}) {
  const { t } = useI18n();
  return (
    <Column gap="8">
      <Row horizontal="between" vertical="end" gap="8" wrap>
        <Column gap="2">
          <Text textVariant="label-strong-s">{t.form.startTitle}</Text>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {t.form.startText}
          </Text>
        </Column>
        {position && (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            prefixIcon="close"
            onClick={() => onChange(null)}
          >
            {t.form.clearPin}
          </Button>
        )}
      </Row>
      <Column height="18rem" radius="m" border overflow="hidden">
        <PinMap
          fill
          controls
          cooperativeGestures
          defaultViewport={{
            center: position ?? [20.9, 44.0],
            zoom: position ? 10 : 6,
          }}
          onMapClick={(p) => onChange([p[0] as number, p[1] as number])}
        >
          {position && (
            <MapMarkers
              items={[{ id: "start", position }]}
              renderItem={() => (
                <MapPin icon="flag" tone="brand" aria-label={t.form.startPin} />
              )}
            />
          )}
        </PinMap>
      </Column>
    </Column>
  );
}
