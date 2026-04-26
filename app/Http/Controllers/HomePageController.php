<?php

namespace App\Http\Controllers;

use App\Models\HomeAbout;
use App\Models\HomeBgSlide;
use App\Models\HomeHero;
use App\Models\HomeHeroImage;
use App\Models\HomeStep;
use App\Models\HomeValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomePageController extends Controller
{
    /* ─── Public endpoint (no auth) ─── */

    public function content(): JsonResponse
    {
        return response()->json([
            'hero'       => HomeHero::first(),
            'bg_slides'  => HomeBgSlide::orderBy('sort_order')->get(),
            'hero_images'=> HomeHeroImage::orderBy('sort_order')->get(),
            'about'      => HomeAbout::first(),
            'values'     => HomeValue::orderBy('sort_order')->get(),
            'steps'      => HomeStep::orderBy('sort_order')->get(),
        ]);
    }

    /* ─── Hero ─── */

    public function updateHero(Request $request): JsonResponse
    {
        $data = $request->validate([
            'badge_text'       => 'nullable|string|max:200',
            'title_part1'      => 'nullable|string|max:100',
            'title_highlight1' => 'nullable|string|max:100',
            'title_part2'      => 'nullable|string|max:100',
            'title_highlight2' => 'nullable|string|max:100',
            'subtitle'         => 'nullable|string|max:1000',
            'btn1_label'       => 'nullable|string|max:100',
            'btn1_link'        => 'nullable|string|max:255',
            'btn2_label'       => 'nullable|string|max:100',
            'stat1_value'      => 'nullable|string|max:50',
            'stat1_label'      => 'nullable|string|max:100',
            'stat2_value'      => 'nullable|string|max:50',
            'stat2_label'      => 'nullable|string|max:100',
            'stat3_value'      => 'nullable|string|max:50',
            'stat3_label'      => 'nullable|string|max:100',
            'float_title'      => 'nullable|string|max:100',
            'float_subtitle'   => 'nullable|string|max:200',
        ]);

        $hero = HomeHero::firstOrCreate([]);
        $hero->update($data);

        return response()->json(['hero' => $hero]);
    }

    /* ─── Background slides ─── */

    public function storeBgSlide(Request $request): JsonResponse
    {
        $data = $request->validate([
            'src'        => 'required|string|max:500',
            'alt'        => 'nullable|string|max:200',
            'sort_order' => 'nullable|integer',
        ]);
        return response()->json(['slide' => HomeBgSlide::create($data)], 201);
    }

    public function updateBgSlide(Request $request, HomeBgSlide $homeBgSlide): JsonResponse
    {
        $data = $request->validate([
            'src'        => 'required|string|max:500',
            'alt'        => 'nullable|string|max:200',
            'sort_order' => 'nullable|integer',
        ]);
        $homeBgSlide->update($data);
        return response()->json(['slide' => $homeBgSlide]);
    }

    public function destroyBgSlide(HomeBgSlide $homeBgSlide): JsonResponse
    {
        $homeBgSlide->delete();
        return response()->json(['message' => 'Slide deleted.']);
    }

    /* ─── Hero images ─── */

    public function heroImages(): JsonResponse
    {
        return response()->json(HomeHeroImage::orderBy('sort_order')->get());
    }

    public function storeHeroImage(Request $request): JsonResponse
    {
        $data = $request->validate([
            'src'        => 'required|string|max:500',
            'alt'        => 'nullable|string|max:200',
            'sort_order' => 'nullable|integer',
        ]);
        $img = HomeHeroImage::create($data);
        return response()->json(['image' => $img], 201);
    }

    public function updateHeroImage(Request $request, HomeHeroImage $homeHeroImage): JsonResponse
    {
        $data = $request->validate([
            'src'        => 'required|string|max:500',
            'alt'        => 'nullable|string|max:200',
            'sort_order' => 'nullable|integer',
        ]);
        $homeHeroImage->update($data);
        return response()->json(['image' => $homeHeroImage]);
    }

    public function destroyHeroImage(HomeHeroImage $homeHeroImage): JsonResponse
    {
        $homeHeroImage->delete();
        return response()->json(['message' => 'Image deleted.']);
    }

    /* ─── About ─── */

    public function updateAbout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image_url'              => 'nullable|string|max:500',
            'years_badge'            => 'nullable|string|max:50',
            'years_label'            => 'nullable|string|max:100',
            'badge_text'             => 'nullable|string|max:100',
            'title'                  => 'nullable|string|max:200',
            'title_highlight'        => 'nullable|string|max:100',
            'subtitle'               => 'nullable|string|max:1000',
            'quote_text'             => 'nullable|string|max:1000',
            'quote_author'           => 'nullable|string|max:200',
            'features'               => 'nullable|array',
            'features.*'             => 'string|max:200',
            'cta_label'              => 'nullable|string|max:100',
            'cta_link'               => 'nullable|string|max:255',
            'values_badge'           => 'nullable|string|max:100',
            'values_title'           => 'nullable|string|max:200',
            'values_title_highlight' => 'nullable|string|max:100',
            'values_subtitle'        => 'nullable|string|max:1000',
            'steps_badge'            => 'nullable|string|max:100',
            'steps_title'            => 'nullable|string|max:200',
            'steps_title_highlight'  => 'nullable|string|max:100',
            'steps_subtitle'         => 'nullable|string|max:1000',
        ]);

        $about = HomeAbout::firstOrCreate([]);
        $about->update($data);

        return response()->json(['about' => $about]);
    }

    /* ─── Values ─── */

    public function indexValues(): JsonResponse
    {
        return response()->json(HomeValue::orderBy('sort_order')->get());
    }

    public function storeValue(Request $request): JsonResponse
    {
        $data = $request->validate([
            'icon'        => 'nullable|string|max:10',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
        ]);
        $value = HomeValue::create($data);
        return response()->json(['value' => $value], 201);
    }

    public function updateValue(Request $request, HomeValue $homeValue): JsonResponse
    {
        $data = $request->validate([
            'icon'        => 'nullable|string|max:10',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
        ]);
        $homeValue->update($data);
        return response()->json(['value' => $homeValue]);
    }

    public function destroyValue(HomeValue $homeValue): JsonResponse
    {
        $homeValue->delete();
        return response()->json(['message' => 'Value deleted.']);
    }

    /* ─── Steps ─── */

    public function indexSteps(): JsonResponse
    {
        return response()->json(HomeStep::orderBy('sort_order')->get());
    }

    public function storeStep(Request $request): JsonResponse
    {
        $data = $request->validate([
            'step_number' => 'nullable|string|max:10',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
        ]);
        $step = HomeStep::create($data);
        return response()->json(['step' => $step], 201);
    }

    public function updateStep(Request $request, HomeStep $homeStep): JsonResponse
    {
        $data = $request->validate([
            'step_number' => 'nullable|string|max:10',
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'sort_order'  => 'nullable|integer',
        ]);
        $homeStep->update($data);
        return response()->json(['step' => $homeStep]);
    }

    public function destroyStep(HomeStep $homeStep): JsonResponse
    {
        $homeStep->delete();
        return response()->json(['message' => 'Step deleted.']);
    }
}
