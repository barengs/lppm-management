<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    public function index()
    {
        return Agenda::orderBy('event_date', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $agenda = Agenda::create($validated);
        return response()->json($agenda, 201);
    }

    public function show(Agenda $agenda)
    {
        return $agenda;
    }

    public function update(Request $request, Agenda $agenda)
    {
         $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'event_date' => 'sometimes|date',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $agenda->update($validated);
        return $agenda;
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();
        return response()->noContent();
    }
}
