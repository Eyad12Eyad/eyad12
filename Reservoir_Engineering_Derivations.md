# Mathematical Derivations for Well Testing Analysis

## 1. Volume of a Slightly Compressible Fluid
**Explanation:** Describes how the volume of a liquid changes as a function of pressure when compressibility is small.

**Step-by-Step Derivation:**
1. Start with the definition of isothermal compressibility:
   $$c = -\frac{1}{V} \frac{\partial V}{\partial p}$$
   *Definition of compressibility coefficient.*

2. Separate the variables to prepare for integration:
   $$\frac{dV}{V} = -c \, dp$$
   *Rearranging variables $V$ and $p$.*

3. Integrate both sides from reference conditions ($V_{ref}, p_{ref}$) to current conditions ($V, p$):
   $$\int_{V_{ref}}^{V} \frac{dV}{V} = -c \int_{p_{ref}}^{p} dp$$
   *Applying definite integration.*

4. Solve the integrals:
   $$\ln\left(\frac{V}{V_{ref}}\right) = -c(p - p_{ref}) = c(p_{ref} - p)$$
   *Evaluating the natural logarithm and linear term.*

5. Exponentiate both sides to solve for $V$:
   $$V = V_{ref} \exp[c(p_{ref} - p)]$$
   *Removing the logarithm using the exponential function.*

6. Apply the Taylor series expansion $e^x \approx 1 + x$ for small $x$:
   $$V = V_{ref} [1 + c(p_{ref} - p)]$$
   *Simplifying the exponential term for slightly compressible fluids.*

---

## 2. Linear Steady-State Flow (Incompressible)
**Explanation:** Calculates the volumetric flow rate through a linear porous medium where pressure and density are constant over time.

**Step-by-Step Derivation:**
1. Start with the differential form of Darcy's Law:
   $$v = \frac{q}{A} = -\frac{k}{\mu} \frac{dp}{dx}$$
   *Relating velocity to pressure gradient and viscosity.*

2. Separate the variables $x$ and $p$:
   $$\frac{q}{A} dx = -\frac{k}{\mu} dp$$
   *Moving flow terms to one side and pressure terms to the other.*

3. Integrate over the length of the system ($0$ to $L$) and pressure drop ($p_1$ to $p_2$):
   $$\int_{0}^{L} \frac{q}{A} dx = -\int_{p_1}^{p_2} \frac{k}{\mu} dp$$
   *Applying integration over the linear path.*

4. Evaluate the integrals assuming $q, A, k, \mu$ are constant:
   $$\frac{qL}{A} = \frac{k}{\mu}(p_1 - p_2)$$
   *Solving the definite integrals.*

5. Solve for the flow rate $q$:
   $$q = \frac{kA(p_1 - p_2)}{\mu L}$$
   *Isolating the volumetric flow rate.*

---

## 3. Radial Steady-State Flow (Incompressible)
**Explanation:** Determines the flow rate into a vertical wellbore where fluid moves concentrically from the drainage radius.

**Step-by-Step Derivation:**
1. Start with the radial form of Darcy's Law:
   $$v = \frac{q}{A_r} = \frac{k}{\mu} \frac{\partial p}{\partial r}$$
   *Defining velocity in radial coordinates.*

2. Substitute the surface area of a cylinder for $A_r$:
   $$\frac{q}{2\pi rh} = \frac{k}{\mu} \frac{dp}{dr}$$
   *Replacing $A_r$ with $2\pi rh$.*

3. Separate variables $r$ and $p$:
   $$\frac{q}{2\pi kh} \frac{dr}{r} = \frac{1}{\mu} dp$$
   *Isolating the radial distance and pressure.*

4. Integrate from wellbore radius ($r_w$) to drainage radius ($r_e$):
   $$\frac{q}{2\pi kh} \int_{r_w}^{r_e} \frac{dr}{r} = \int_{p_{wf}}^{p_e} \frac{1}{\mu} dp$$
   *Applying definite integration for the radial system.*

5. Solve the integrals:
   $$\frac{q}{2\pi kh} \ln\left(\frac{r_e}{r_w}\right) = \frac{p_e - p_{wf}}{\mu}$$
   *Evaluating the natural log of the radius ratio.*

6. Solve for $q$ (incorporating field unit conversion factor $0.00708$):
   $$Q_o = \frac{0.00708 kh (p_e - p_{wf})}{\mu B_o \ln(r_e/r_w)}$$
   *Isolating flow rate and adding the formation volume factor $B_o$.*

---

## 4. The Diffusivity Equation
**Explanation:** The governing partial differential equation that describes pressure propagation over time and space in a radial reservoir.

**Step-by-Step Derivation:**
1. Start with the Continuity Equation (Mass Balance) in radial coordinates:
   $$\frac{1}{r} \frac{\partial}{\partial r}[r(\rho v)] = \frac{\partial(\phi \rho)}{\partial t}$$
   *Defining mass conservation for a radial element.*

2. Substitute Darcy's Law for velocity $v$:
   $$v = \frac{k}{\mu} \frac{\partial p}{\partial r}$$
   *Replacing velocity with the transport equation.*

3. Combine the expressions into the general PDE:
   $$\frac{0.006328}{r} \frac{\partial}{\partial r} \left[ \frac{k}{\mu} (\rho r) \frac{\partial p}{\partial r} \right] = \frac{\partial (\phi \rho)}{\partial t}$$
   *Substituting Darcy's Law into the continuity equation.*

4. Expand the right-hand side using the product rule:
   $$\frac{\partial (\phi \rho)}{\partial t} = \phi \frac{\partial \rho}{\partial t} + \rho \frac{\partial \phi}{\partial t}$$
   *Applying the partial derivative to the product of porosity and density.*

5. Substitute compressibility definitions: $c_f = \frac{1}{\phi} \frac{\partial \phi}{\partial p}$ and $c = \frac{1}{\rho} \frac{\partial \rho}{\partial p}$:
   $$\frac{\partial \phi}{\partial t} = \phi c_f \frac{\partial p}{\partial t}, \quad \frac{\partial \rho}{\partial t} = \rho c \frac{\partial p}{\partial t}$$
   *Replacing time-derivatives of $\phi$ and $\rho$ with pressure derivatives.*

6. Simplify the combined equation:
   $$0.006328 \left[ \frac{\partial^2 p}{\partial r^2} + \frac{1}{r} \frac{\partial p}{\partial r} \right] = \phi (c_f + c) \frac{\mu}{k} \frac{\partial p}{\partial t}$$
   *Dividing by $\rho$ and neglecting the small term $c (\partial p / \partial r)^2$.*

7. Define total compressibility $c_t = c + c_f$ and rearrange for the final Diffusivity form:
   $$\frac{\partial^2 p}{\partial r^2} + \frac{1}{r} \frac{\partial p}{\partial r} = \frac{\phi \mu c_t}{0.0002637 k} \frac{\partial p}{\partial t}$$
   *Final rearrangement into the standard diffusivity equation format.*

---

## 5. Real-Gas Pseudopressure $m(p)$
**Explanation:** A linearization technique used to account for the fact that gas viscosity and the Z-factor vary significantly with pressure.

**Step-by-Step Derivation:**
1. Identify the non-linear term in the gas flow equation:
   $$\text{Term} = \frac{2p}{\mu Z}$$
   *Isolating the pressure-dependent properties.*

2. Define the pseudopressure $m(p)$ as the integral of this term:
   $$m(p) = \int_{0}^{p} \frac{2p'}{\mu Z} dp'$$
   *Integrating the property ratio from zero to pressure $p$.*

3. Apply the chain rule to relate derivatives of $p$ to derivatives of $m(p)$:
   $$\frac{\partial m(p)}{\partial r} = \frac{\partial m(p)}{\partial p} \frac{\partial p}{\partial r} = \frac{2p}{\mu Z} \frac{\partial p}{\partial r}$$
   *Changing the variable of differentiation.*

4. Substitute these relations into the radial diffusivity equation:
   $$\frac{\partial^2 m(p)}{\partial r^2} + \frac{1}{r} \frac{\partial m(p)}{\partial r} = \frac{\phi \mu c_t}{0.0002 la k} \frac{\partial m(p)}{\partial t}$$
   *Linearizing the PDE by replacing $p$ with $m(p)$.*

---

## Derivation of Constants

### 1. The Constant $0.001127$ (Linear Flow)
This constant converts Darcy's original units ($\text{cm}, \text{atm}, \text{cp}, \text{s}$) into Petroleum Field Units ($\text{ft}, \text{psi}, \text{bbl/day}, \text{md}$).
- $1 \text{ Darcy} = 1 \text{ atm}\cdot\text{cm}^3/(\text{cp}\cdot\text{cm}\cdot\text{s})$
- $1 \text{ bbl} = 158,987 \text{ cm}^3$
- $1 \text{ day} = 86,400 \text{ s}$
- $1 \text{ atm} = 14.696 \text{ psi}$
- $1 \text{ md} = 10^{-3} \text{ Darcy}$
- $1 \text{ ft} = 30.48 \text{ cm}$

The conversion factor is derived as:
$$\text{Factor} = \frac{14.696 \times 30.48}{158,987 \times 86,400 \times 10^{-3}} \approx 0.001127$$

### 2. The Constant $0.00708$ (Radial Flow)
This constant appears in the integrated radial flow equation. It is the result of the $0.001127$ conversion factor combined with the $2\pi$ geometry of the cylinder.
$$\text{Factor} = \frac{0.001127}{2\pi} \times (\text{Unit Adjustments}) \approx 0.00708$$
*Note: In many textbooks, this is expressed as $\frac{1}{141.2}$ where $1/0.00708 \approx 141.2$.*

### 3. The Constant $0.0002637$ (Diffusivity)
This constant converts the time variable in the diffusivity equation from **days** to **hours** while maintaining the consistency of pressure ($\text{psi}$), permeability ($\text{md}$), and distance ($\text{ft}$).
$$\text{Factor} = \frac{0.006328}{24} \approx 0.0002637$$

### 4. The Constant $162.6$ (Log Approximation)
This constant originates from the approximation of the Exponential Integral $Ei(-x)$. When $x < 0.01$, $Ei(-x) \approx \ln(1.781x)$. The $162.6$ factor is the resulting coefficient after converting the natural logarithm ($\ln$) to a common logarithm ($\log_{10}$) and integrating the line source solution.
$$\text{Factor} \approx 141.2 \times \ln(10) \times \dots \approx 162.6$$
