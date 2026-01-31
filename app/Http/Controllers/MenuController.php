<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MenuController extends Controller
{
    public function index()
    {
        return response()->json(Menu::all());
    }

    public function show($idOrLocation)
    {
        // Allow fetching by ID or Location string
        $menu = Menu::where('id', $idOrLocation)
                    ->orWhere('location', $idOrLocation)
                    ->firstOrFail();
        
        return response()->json([
            'menu' => $menu,
            'items' => $menu->tree()
        ]);
    }

    public function store(Request $request) 
    {
        // For creating new Menus (containers)
        $validated = $request->validate([
            'name' => 'required|string',
            'location' => 'required|string|unique:menus,location'
        ]);
        return response()->json(Menu::create($validated));
    }

    public function storeItem(Request $request, $menuId)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'url' => 'nullable|string',
            'target' => 'nullable|string',
            'parent_id' => 'nullable|exists:menu_items,id'
        ]);

        $item = new MenuItem($validated);
        $item->menu_id = $menuId;
        $item->order = MenuItem::where('menu_id', $menuId)->max('order') + 1;
        $item->save();

        return response()->json($item);
    }

    public function updateItem(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);
        $item->update($request->only(['title', 'url', 'target', 'icon', 'order', 'parent_id']));
        return response()->json($item);
    }

    public function destroyItem($id)
    {
        MenuItem::destroy($id);
        return response()->json(['message' => 'Item deleted']);
    }

    /**
     * Update the full structure (order and nesting) of menu items.
     * Expects a nested array of items: [{id: 1, children: [{id: 2}, ...]}, ...]
     */
    public function updateStructure(Request $request, $menuId)
    {
        $structure = $request->input('structure', []);
        
        DB::transaction(function () use ($structure) {
            $this->saveTree($structure);
        });

        return response()->json(['message' => 'Structure updated']);
    }

    private function saveTree(array $nodes, $parentId = null)
    {
        foreach ($nodes as $index => $node) {
            $item = MenuItem::find($node['id']);
            if ($item) {
                $item->parent_id = $parentId;
                $item->order = $index;
                $item->save();

                if (isset($node['children']) && !empty($node['children'])) {
                    $this->saveTree($node['children'], $item->id);
                }
            }
        }
    }
}
