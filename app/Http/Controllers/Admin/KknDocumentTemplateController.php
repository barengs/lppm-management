<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KknDocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KknDocumentTemplateController extends Controller
{
    /**
     * Get all templates (filterable by fiscal year)
     */
    public function index(Request $request)
    {
        $query = KknDocumentTemplate::with('fiscalYear');

        if ($request->has('fiscal_year_id')) {
            $query->forFiscalYear($request->fiscal_year_id);
        } else {
            $query->orderBy('order');
        }

        return response()->json($query->get());
    }

    /**
     * Get templates for a specific fiscal year (public endpoint for registration)
     */
    public function getForFiscalYear(Request $request)
    {
        $fiscalYearId = $request->input('fiscal_year_id');
        
        if (!$fiscalYearId) {
            return response()->json(['message' => 'fiscal_year_id is required'], 400);
        }

        $templates = KknDocumentTemplate::forFiscalYear($fiscalYearId)->get();

        return response()->json($templates);
    }

    /**
     * Create new template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fiscal_year_id' => 'nullable|exists:fiscal_years,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:kkn_document_templates,slug',
            'is_required' => 'boolean',
            'order' => 'integer',
            'description' => 'nullable|string',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        // Auto-set order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = KknDocumentTemplate::where('fiscal_year_id', $validated['fiscal_year_id'] ?? null)
                ->max('order');
            $validated['order'] = ($maxOrder ?? 0) + 1;
        }

        $template = KknDocumentTemplate::create($validated);

        return response()->json($template->load('fiscalYear'), 201);
    }

    /**
     * Update template
     */
    public function update(Request $request, $id)
    {
        $template = KknDocumentTemplate::findOrFail($id);

        $validated = $request->validate([
            'fiscal_year_id' => 'nullable|exists:fiscal_years,id',
            'name' => 'string|max:255',
            'slug' => 'string|max:255|unique:kkn_document_templates,slug,' . $id,
            'is_required' => 'boolean',
            'order' => 'integer',
            'description' => 'nullable|string',
        ]);

        $template->update($validated);

        return response()->json($template->load('fiscalYear'));
    }

    /**
     * Delete template
     */
    public function destroy($id)
    {
        $template = KknDocumentTemplate::findOrFail($id);
        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }

    /**
     * Reorder templates
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'templates' => 'required|array',
            'templates.*.id' => 'required|exists:kkn_document_templates,id',
            'templates.*.order' => 'required|integer',
        ]);

        foreach ($validated['templates'] as $item) {
            KknDocumentTemplate::where('id', $item['id'])
                ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Templates reordered successfully']);
    }
}
