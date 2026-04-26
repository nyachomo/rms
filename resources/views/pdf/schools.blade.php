<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size:12px; color:#1a1a2e; padding:28px 36px; }
@page { margin: 28px 36px; }

/* ── Letterhead ── */
.lh-wrap {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
    border-bottom: 4px solid #f59e0b;
}
.lh-left {
    width: 36%;
    background: #fff;
    padding: 18px 20px;
    vertical-align: middle;
    text-align: center;
}
.lh-logo-img { width: 80px; height: 80px; object-fit: contain; }
.lh-logo-box {
    display: inline-block;
    width: 80px; height: 80px;
    background: #0d2b5e;
    border-radius: 50%;
    color: #fff;
    font-size: 26px;
    font-weight: 700;
    line-height: 80px;
    text-align: center;
}
.lh-right {
    background: #fff;
    padding: 0;
    vertical-align: top;
}
.navy-block {
    background: #0d2b5e;
    border-radius: 70px 0 0 70px;
    padding: 18px 24px 0 36px;
    color: #fff;
    overflow: hidden;
}
.co-name {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.3px;
    margin-bottom: 10px;
}
.co-details { border-collapse: collapse; width: 100%; }
.co-details td {
    vertical-align: middle;
    padding: 3px 16px 3px 0;
    font-size: 11px;
    color: rgba(255,255,255,0.88);
    white-space: nowrap;
}
.icon-dot {
    display: inline-block;
    width: 14px; height: 14px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    text-align: center;
    line-height: 14px;
    font-size: 8px;
    margin-right: 5px;
    color: #f59e0b;
}
.swoosh {
    background: #f59e0b;
    height: 13px;
    border-radius: 50px 0 0 0;
    margin-top: 14px;
    margin-left: 30%;
}

/* ── Report title bar ── */
.rpt { width:100%; border-collapse:collapse; background:#0d2b5e; margin-bottom:14px; }
.rpt td { padding:10px 14px; vertical-align:middle; color:#fff; }
.rpt-title { font-size:15px; font-weight:700; }
.rpt-sub   { font-size:11px; color:rgba(255,255,255,.65); margin-top:2px; }
.rpt-right { text-align:right; font-size:11px; color:rgba(255,255,255,.6); width:180px; white-space:nowrap; }

/* ── Vision/Mission ── */
.vm { border-left:4px solid #f59e0b; background:#f8faff; padding:7px 12px; margin-bottom:14px; font-size:9px; color:#444; line-height:1.6; }
.vm strong { color:#0d2b5e; }

/* ── Summary pills ── */
.summary { width:100%; border-collapse:collapse; margin-bottom:12px; }
.summary td { width:33%; border:1px solid #e5e7eb; padding:9px 12px; vertical-align:top; }
.s-val { font-size:22px; font-weight:700; color:#0d2b5e; }
.s-lbl { font-size:10px; color:#888; text-transform:uppercase; letter-spacing:.5px; margin-top:2px; }

/* ── Cap warning ── */
.cap-note { background:#fffbeb; border:1px solid #fcd34d; padding:6px 12px; margin-bottom:10px; font-size:11px; color:#92400e; }

/* ── Schools table ── */
.tbl { width:100%; border-collapse:collapse; }
.tbl thead tr { background:#0d2b5e; }
.tbl thead th { padding:9px 10px; text-align:left; font-size:10px; color:#fff; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
.tbl tbody tr.even { background:#f8faff; }
.tbl tbody td { padding:8px 10px; font-size:11.5px; border-bottom:1px solid #f0f0f0; }
.act  { color:#16a34a; font-weight:700; }
.arc  { color:#9ca3af; font-weight:700; }
.num  { color:#bbb; font-size:9px; }

/* ── Footer ── */
.foot { border-top:3px solid #f59e0b; padding-top:8px; margin-top:18px; }
.foot table { width:100%; border-collapse:collapse; }
.foot td { font-size:10px; color:#aaa; vertical-align:middle; }
.foot .fr { text-align:right; }
</style>
</head>
<body>

{{-- ══════════════════════════════════════════
     LETTERHEAD
══════════════════════════════════════════ --}}
<table class="lh-wrap">
<tr>
    {{-- LEFT: white section with logo --}}
    <td class="lh-left">
        @if($settings->company_logo && file_exists(storage_path('app/public/' . $settings->company_logo)))
            <img class="lh-logo-img" src="{{ storage_path('app/public/' . $settings->company_logo) }}" alt="logo"/>
        @else
            <div class="lh-logo-box">{{ strtoupper(substr($settings->company_name ?? 'T', 0, 2)) }}</div>
        @endif
    </td>

    {{-- RIGHT: navy block with wave left edge + orange swoosh --}}
    <td class="lh-right">
        <div class="navy-block">
            <div class="co-name">{{ $settings->company_name ?? 'Company Name' }}</div>

            <table class="co-details">
                @if($settings->company_address)
                <tr>
                    <td><span class="icon-dot">&#9679;</span>{{ $settings->company_address }}</td>
                </tr>
                @endif
                <tr>
                    @if($settings->company_phone)
                    <td><span class="icon-dot">&#9742;</span>{{ $settings->company_phone }}</td>
                    @endif
                    @if($settings->company_email)
                    <td><span class="icon-dot">&#9993;</span>{{ $settings->company_email }}</td>
                    @endif
                </tr>
                @if($settings->company_kra_pin)
                <tr>
                    <td colspan="2"><span class="icon-dot">&#9830;</span>KRA PIN: {{ $settings->company_kra_pin }}</td>
                </tr>
                @endif
            </table>

            {{-- Orange swoosh at bottom --}}
            <div class="swoosh"></div>
        </div>
    </td>
</tr>
</table>

{{-- REPORT HEADER --}}
<table class="rpt">
<tr>
    <td>
        <div class="rpt-title">Schools &amp; Partner Institutions</div>
        <div class="rpt-sub">
            @php
                $filters = [];
                if($search)   $filters[] = 'Search: "' . $search . '"';
                if($status)   $filters[] = 'Status: ' . ucfirst($status);
                if($location) $filters[] = 'Location: ' . $location;
            @endphp
            @if(count($filters) > 0)
                {{ implode(' · ', $filters) }}
            @else
                All registered partner schools
            @endif
        </div>
    </td>
    <td class="rpt-right">Generated: {{ now()->format('d M Y, H:i') }}</td>
</tr>
</table>

{{-- SUMMARY --}}
<table class="summary">
<tr>
    <td><div class="s-val">{{ $total }}</div><div class="s-lbl">Total Schools</div></td>
    <td style="padding-left:6px;"><div class="s-val">{{ $schools->where('school_status','active')->count() }}</div><div class="s-lbl">Active (this export)</div></td>
    <td style="padding-left:6px;"><div class="s-val">{{ $schools->where('school_status','archived')->count() }}</div><div class="s-lbl">Archived (this export)</div></td>
</tr>
</table>

{{-- CAP WARNING --}}
@if($capped)
<div class="cap-note">
    &#9888; This PDF shows the first {{ $limit }} of {{ $total }} schools. Use the search / filter on the Schools page to export a specific subset.
</div>
@endif

{{-- SCHOOLS TABLE --}}
<table class="tbl">
    <thead>
        <tr>
            <th style="width:26px;">#</th>
            <th>School Name</th>
            <th>Location</th>
            <th>Contact Person</th>
            <th style="width:68px;">Status</th>
            <th style="width:78px;">Date Added</th>
        </tr>
    </thead>
    <tbody>
        @forelse($schools as $i => $school)
        <tr class="{{ $i % 2 === 1 ? 'even' : '' }}">
            <td class="num">{{ $i + 1 }}</td>
            <td><strong>{{ $school->school_name }}</strong></td>
            <td>{{ $school->school_location }}</td>
            <td>{{ $school->school_contact_person }}</td>
            <td class="{{ $school->school_status === 'active' ? 'act' : 'arc' }}">{{ ucfirst($school->school_status) }}</td>
            <td>{{ $school->created_at->format('d M Y') }}</td>
        </tr>
        @empty
        <tr><td colspan="6" style="text-align:center;padding:18px;color:#aaa;">No schools found.</td></tr>
        @endforelse
    </tbody>
</table>

{{-- FOOTER --}}
<div class="foot">
    <table>
        <tr>
            <td>{{ $settings->company_name ?? 'Techsphere' }} &nbsp;&middot;&nbsp; Schools Report &nbsp;&middot;&nbsp; {{ now()->format('d M Y') }}</td>
            <td class="fr">CONFIDENTIAL</td>
        </tr>
    </table>
</div>

</body>
</html>
