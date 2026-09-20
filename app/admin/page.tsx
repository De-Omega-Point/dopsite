import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { ADMIN_EMAILS } from "./admin-auth";
import { createProduct, deleteProduct, duplicateProduct, listProducts, listVisibilityLeads, setProductStatus } from "./actions";
import "./admin.css";
import "./admin-earth.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase() as (typeof ADMIN_EMAILS)[number])) {
    return <main className="admin-denied"><div><span>ACCESS / DENIED</span><h1>Administrator clearance required.</h1><p>You are signed in as <strong>{user.email}</strong>, but this address is not on the platform administrator list.</p><p>Sign out, then use an authorised De‑Omega‑Point administrator account.</p><div className="denied-actions"><a href={chatGPTSignOutPath("/admin")}>Sign in with another account</a><a href="/platform">Return to platform</a></div></div></main>;
  }
  const [products, visibilityLeads] = await Promise.all([listProducts(), listVisibilityLeads()]);
  const published = products.filter((product) => product.status === "published").length;
  const archived = products.filter((product) => product.status === "archived").length;
  const completion = products.length ? Math.round((published / products.length) * 100) : 0;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/platform"><span><img src="/assets/de-omega-point-emblem-v2.png" alt="" /></span><div><strong>DE‑OMEGA</strong><small>ADMIN CONTROL</small></div></a>
        <nav aria-label="Admin sections"><a className="active" href="#overview">Overview</a><a href="#visibility-leads">AI Visibility</a><a href="#products">Products</a><a href="#orders">Orders</a><a href="#customers">Customers</a><a href="#releases">Releases</a><a href="#settings">Settings</a><a href="#access">Access</a></nav>
        <div className="admin-account"><small>AUTHORISED ADMIN</small><strong>{user.displayName}</strong><span>{user.email}</span><a href={chatGPTSignOutPath("/platform")}>Sign out</a></div>
      </aside>

      <section className="admin-main">
        <header><div><p>PLATFORM OPERATIONS / EARTH STATION</p><h1 id="overview">Command centre</h1><span className="admin-subtitle">Manage products, releases, customers and platform readiness.</span></div><div className="header-actions"><a href="#products">Add product</a><a href="/platform">View platform <span>↗</span></a></div></header>
        <div className="admin-stats">
          <article><span>TOTAL PRODUCTS</span><strong>{products.length}</strong><small>Platform catalogue</small></article>
          <article><span>PUBLISHED</span><strong>{published}</strong><small>Visible releases</small></article>
          <article><span>VISIBILITY LEADS</span><strong>{visibilityLeads.length}</strong><small>Audit requests</small></article>
          <article><span>LAUNCH READINESS</span><strong>{completion}%</strong><small>{archived} archived products</small></article>
        </div>

        <section className="admin-overview-grid">
          <article className="earth-card readiness-card"><div><p>RELEASE READINESS</p><h2>Build toward launch</h2></div><div className="readiness-meter"><span style={{width:`${completion}%`}}/><strong>{completion}%</strong></div><ul><li className={products.length > 0 ? "done" : ""}>Create the first product</li><li className={published > 0 ? "done" : ""}>Publish a customer-ready release</li><li>Connect payments and delivery</li><li>Test the purchase journey</li></ul></article>
          <article className="earth-card activity-card"><div><p>RECENT CATALOGUE ACTIVITY</p><h2>Latest changes</h2></div>{products.length === 0 ? <span className="quiet">Activity will appear after your first product is created.</span> : <ol>{products.slice(0,4).map((product)=><li key={product.id}><span>{product.title}</span><small>{product.status} · {new Date(product.updated_at*1000).toLocaleDateString("en-AU")}</small></li>)}</ol>}</article>
        </section>

        <section className="admin-panel" id="visibility-leads">
          <div className="panel-heading"><div><p>AI VISIBILITY PIPELINE</p><h2>Audit requests</h2></div><span>{visibilityLeads.length} leads</span></div>
          <div className="product-table visibility-lead-table">
            <div className="table-row table-head"><span>Business</span><span>Category</span><span>Location</span><span>Score</span><span>Contact</span></div>
            {visibilityLeads.length === 0 ? <div className="empty-state"><strong>No audit requests yet.</strong><span>New requests from the AI Visibility Check will appear here.</span></div> : visibilityLeads.map((lead) => (
              <article className="table-row" key={lead.id}>
                <span><strong>{lead.business_name}</strong><small>{lead.business_url}</small></span><span>{lead.category}</span><span>{lead.location}</span><span className="status status-published">{lead.score}/100</span><span><a href={`mailto:${lead.email}?subject=Your%20De-Omega-Point%20AI%20Visibility%20Benchmark`}>{lead.email}</a><small>{new Date(lead.created_at*1000).toLocaleDateString("en-AU")}</small></span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel" id="products">
          <div className="panel-heading"><div><p>CATALOGUE CONTROL</p><h2>Products</h2></div><span>{products.length} records</span></div>
          <form className="product-form" action={createProduct}>
            <label>Product name<input name="title" required placeholder="e.g. AI Proof-First Product Kit" /></label>
            <label>Category<input name="category" required placeholder="Toolkit / Founders" /></label>
            <label className="wide">Description<textarea name="description" required placeholder="What it does and who it helps" /></label>
            <label>Price (AUD)<input name="price" required type="number" min="0" step="0.01" placeholder="49.00" /></label>
            <button type="submit">Create draft <span>＋</span></button>
          </form>

          <div className="product-table">
            <div className="table-row table-head"><span>Product</span><span>Category</span><span>Price</span><span>Status</span><span>Controls</span></div>
            {products.length === 0 ? <div className="empty-state"><strong>No platform products yet.</strong><span>Create the first draft above.</span></div> : products.map((product) => (
              <article className="table-row" key={product.id}>
                <span><strong>{product.title}</strong><small>{product.description}</small></span><span>{product.category}</span><span>A${(product.price_cents/100).toFixed(2)}</span><span className={`status status-${product.status}`}>{product.status}</span>
                <span className="row-actions"><form action={setProductStatus}><input type="hidden" name="id" value={product.id}/><select name="status" defaultValue={product.status}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><button>Save</button></form><form action={duplicateProduct}><input type="hidden" name="id" value={product.id}/><button className="duplicate">Duplicate</button></form><form action={deleteProduct}><input type="hidden" name="id" value={product.id}/><button className="delete">Delete</button></form></span>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-twin-grid">
          <article className="admin-panel management-card" id="orders"><div className="panel-heading"><div><p>COMMERCE</p><h2>Orders</h2></div><span>0 open</span></div><div className="management-empty"><span>◎</span><strong>No orders yet</strong><p>Orders, payment status and fulfilment will appear here once checkout is connected.</p><button disabled>Connect checkout — next phase</button></div></article>
          <article className="admin-panel management-card" id="customers"><div className="panel-heading"><div><p>AUDIENCE</p><h2>Customers</h2></div><span>Early access</span></div><div className="management-empty"><span>◉</span><strong>Build the launch audience</strong><p>Track members, early-access requests and product entitlements from this workspace.</p><a href="mailto:hello@de-omega-point.com?subject=Platform%20customer%20list">Open customer inbox ↗</a></div></article>
        </section>

        <section className="admin-panel release-panel" id="releases"><div><p>RELEASE CONTROL</p><h2>Platform status</h2><span>Control what visitors understand about the current stage.</span></div><div className="release-status"><span className="pulse"/> Early access / Building</div><div className="release-steps"><span className="active">01 Build</span><span>02 Test</span><span>03 Launch</span><span>04 Scale</span></div></section>
        <section className="admin-panel settings-panel" id="settings"><div><p>PLATFORM SETTINGS</p><h2>Operations</h2></div><div className="settings-grid"><div><span>Currency</span><strong>AUD — Australian Dollar</strong></div><div><span>Market</span><strong>Australia / Global</strong></div><div><span>Store mode</span><strong>Early access</strong></div><div><span>Product owner</span><strong>De‑Omega‑Point</strong></div></div></section>
        <section className="admin-panel compact" id="access"><div><p>SECURITY</p><h2>Administrator access</h2></div><div className="access-card">{ADMIN_EMAILS.map((email) => <strong key={email}>{email}</strong>)}<span>{ADMIN_EMAILS.length} authorised administrator accounts</span></div></section>
      </section>
    </main>
  );
}
